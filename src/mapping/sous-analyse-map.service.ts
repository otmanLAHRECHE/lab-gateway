import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,FindOptionsWhere,IsNull } from 'typeorm';
import { SousAnalyseMap } from './sous-analyse-map.entity';
import { CreateSousAnalyseMapDto } from './dto/create-sous-analyse-map.dto';
import { UpdateSousAnalyseMapDto } from './dto/update-sous-analyse-map.dto';
import { SousAnalyseRef } from '../refs/sous-analyse-ref.entity';

import { DeviceAvailableTest } from './device-available-test.entity';
import { BootstrapDeviceTestsDto } from './dto/bootstrap-device-tests.dto';

@Injectable()
export class SousAnalyseMapService {
  constructor(
    @InjectRepository(SousAnalyseMap) private readonly repo: Repository<SousAnalyseMap>,
  @InjectRepository(SousAnalyseRef) private readonly sousRefRepo: Repository<SousAnalyseRef>,
  @InjectRepository(DeviceAvailableTest)
    private readonly deviceTestRepo: Repository<DeviceAvailableTest>,
  ) {}

  create(dto: CreateSousAnalyseMapDto) {
    const entity = this.repo.create({
      ...dto,
      instrument_code: dto.instrument_code.trim(),
      external_code: dto.external_code.trim().toUpperCase(),
      external_system: dto.external_system?.trim() ?? null,
      priority: dto.priority ?? 0,
      is_active: dto.is_active ?? true,
    });
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ relations: { sous_analyse_ref: true }, order: { instrument_code: 'ASC', external_code: 'ASC' } });
  }


  

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: { sous_analyse_ref: true } });
    if (!row) throw new NotFoundException('Mapping not found');
    return row;
  }

  async update(id: number, dto: UpdateSousAnalyseMapDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Mapping not found');

    if (dto.instrument_code !== undefined) row.instrument_code = dto.instrument_code.trim();
    if (dto.external_code !== undefined) row.external_code = dto.external_code.trim().toUpperCase();
    if (dto.external_system !== undefined) row.external_system = dto.external_system?.trim() ?? null;
    if (dto.sous_analyse_ref_id !== undefined) row.sous_analyse_ref_id = dto.sous_analyse_ref_id;
    if (dto.priority !== undefined) row.priority = dto.priority;
    if (dto.is_active !== undefined) row.is_active = dto.is_active;

    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Mapping not found');
    await this.repo.delete(id);
    return { ok: true };
  }

  // ✅ used later in ingest()
  findActiveMapping(
  instrument_code: string,
  external_code: string,
  external_system?: string | null,
) {
  const where: FindOptionsWhere<SousAnalyseMap> = {
    instrument_code: instrument_code.trim(),
    external_code: external_code.trim().toUpperCase(),
    is_active: true,
  };

  // If caller provided external_system:
  // - empty string => treat as NULL
  // - value => match value
  // If caller did NOT provide it => don't filter by it
  if (external_system !== undefined) {
    const sys = external_system?.trim();
    where.external_system = sys ? sys : IsNull();
  }

  return this.repo.findOne({
    where,
    order: { priority: 'DESC' },
  });
}


  private normalizeCode(value?: string | null) {
    return (value ?? '').toString().trim().toUpperCase();
  }

  private normalizeName(value?: string | null) {
    return (value ?? '')
      .toString()
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  async bootstrapFromDevice(dto: BootstrapDeviceTestsDto) {
    const instrumentCode = dto.instrument_code.trim();
    const tests = dto.tests ?? [];

    if (!tests.length) {
      return {
        ok: true,
        instrument_code: instrumentCode,
        received: 0,
        mapped_by_code: 0,
        mapped_by_name: 0,
        unmapped: [],
      };
    }

    const refs = await this.sousRefRepo.find();

    const refByCode = new Map<string, SousAnalyseRef>();
    const refByName = new Map<string, SousAnalyseRef>();

    for (const r of refs) {
      const code = this.normalizeCode(r.code);
      const name = this.normalizeName(r.libelle);

      if (code && !refByCode.has(code)) refByCode.set(code, r);
      if (name && !refByName.has(name)) refByName.set(name, r);
    }

    let mappedByCode = 0;
    let mappedByName = 0;
    const unmapped: Array<{ external_code: string; external_name: string | null }> = [];

    for (const t of tests) {
      const externalCode = this.normalizeCode(t.external_code);
      const externalName = t.external_name?.trim() ?? null;
      const normalizedName = this.normalizeName(externalName);
      const externalSystem = t.external_system?.trim() ?? null;

      if (!externalCode) continue;

      let matchedRef: SousAnalyseRef | undefined;
      let matchSource: 'code' | 'name' | null = null;

      // 1) exact code match
      matchedRef = refByCode.get(externalCode);
      if (matchedRef) {
        matchSource = 'code';
        mappedByCode++;
      } else if (normalizedName) {
        // 2) exact normalized name match
        matchedRef = refByName.get(normalizedName);
        if (matchedRef) {
          matchSource = 'name';
          mappedByName++;
        }
      }

      // Save/update device catalog row
      await this.deviceTestRepo.upsert(
        [
          {
            instrument_code: instrumentCode,
            external_code: externalCode,
            external_name: externalName,
            external_system: externalSystem,
            is_mapped: !!matchedRef,
            sous_analyse_ref_id: matchedRef?.sous_analyse_id ?? null,
          },
        ],
        ['instrument_code', 'external_code'],
      );

      if (matchedRef) {
        // Save/update authoritative mapping row
        await this.repo.upsert(
          [
            {
              instrument_code: instrumentCode,
              external_code: externalCode,
              external_system: externalSystem,
              sous_analyse_ref_id: matchedRef.sous_analyse_id,
              priority: 0,
              is_active: true,
            },
          ],
          ['instrument_code', 'external_code', 'external_system'],
        );
      } else {
        unmapped.push({
          external_code: externalCode,
          external_name: externalName,
        });
      }
    }

    return {
      ok: true,
      instrument_code: instrumentCode,
      received: tests.length,
      mapped_by_code: mappedByCode,
      mapped_by_name: mappedByName,
      unmapped,
    };
  }




  getDeviceTests(instrumentCode: string, isMapped?: boolean) {
    const where: FindOptionsWhere<DeviceAvailableTest> = {
      instrument_code: instrumentCode.trim(),
    };

    if (isMapped !== undefined) {
      where.is_mapped = isMapped;
    }

    return this.deviceTestRepo.find({
      where,
      order: { external_code: 'ASC' },
    });
  }


  getAllDeviceTests(
  instrumentCode?: string,
  isMapped?: boolean,
) {
  const where: any = {};

  if (instrumentCode) {
    where.instrument_code = instrumentCode.trim();
  }

  if (isMapped !== undefined) {
    where.is_mapped = isMapped;
  }

  return this.deviceTestRepo.find({
    where,
    order: {
      instrument_code: 'ASC',
      external_code: 'ASC',
    },
  });
}



async manualMapDeviceTest(deviceTestId: number, sousAnalyseRefId: number, externalSystem?: string | null) {
  const deviceTest = await this.deviceTestRepo.findOne({
    where: { id: deviceTestId },
  });

  if (!deviceTest) {
    throw new NotFoundException('Device test not found');
  }

  const sousRef = await this.sousRefRepo.findOne({
    where: { sous_analyse_id: sousAnalyseRefId },
  });

  if (!sousRef) {
    throw new NotFoundException('Sous analyse ref not found');
  }

  const extSystem =
    externalSystem !== undefined
      ? (externalSystem?.trim() || null)
      : deviceTest.external_system;

  // create/update authoritative mapping
  await this.repo.upsert(
    [
      {
        instrument_code: deviceTest.instrument_code.trim(),
        external_code: deviceTest.external_code.trim().toUpperCase(),
        external_system: extSystem,
        sous_analyse_ref_id: sousAnalyseRefId,
        priority: 0,
        is_active: true,
      },
    ],
    ['instrument_code', 'external_code', 'external_system'],
  );

  // update device catalog cache
  deviceTest.is_mapped = true;
  deviceTest.sous_analyse_ref_id = sousAnalyseRefId;
  deviceTest.external_system = extSystem;
  await this.deviceTestRepo.save(deviceTest);

  return {
    ok: true,
    device_test_id: deviceTest.id,
    instrument_code: deviceTest.instrument_code,
    external_code: deviceTest.external_code,
    sous_analyse_ref_id: sousAnalyseRefId,
    mapped: true,
  };
}







}