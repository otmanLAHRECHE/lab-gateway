import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ResultBatch } from './result-batch.entity';
import { ResultItem } from './result-item.entity';
import { IngestResultDto } from './dto/ingest-result.dto';

import { SousAnalyseRef } from '../refs/sous-analyse-ref.entity';
import { AnalyseRef } from '../refs/analyse-ref.entity';
import { SousAnalyseMap } from '../mapping/sous-analyse-map.entity';

@Injectable()
export class ResultatService {
  constructor(
    @InjectRepository(ResultBatch)
    private readonly batchRepo: Repository<ResultBatch>,

    @InjectRepository(ResultItem)
    private readonly itemRepo: Repository<ResultItem>,

    @InjectRepository(SousAnalyseRef)
    private readonly sousRefRepo: Repository<SousAnalyseRef>,

    @InjectRepository(AnalyseRef)
    private readonly analyseRefRepo: Repository<AnalyseRef>,

    @InjectRepository(SousAnalyseMap)
    private readonly mapRepo: Repository<SousAnalyseMap>, 
  ) {}

  //async ingest(dto: IngestResultDto) {
   // const receivedAt = new Date();

  //  const batch = await this.batchRepo.save(
  //    this.batchRepo.create({
  //      barcode: dto.barcode,
   //     instrument_code: dto.instrument_code ?? null,
   //     raw_hl7: dto.raw_hl7 ?? null,
   //     received_at: receivedAt,
   //   }),
   // );

   // const items = (dto.items ?? []).map((it) => {
   //   const rawCode = (it.code ?? '').toString().trim().toUpperCase();

   //   return this.itemRepo.create({
 //       batch_id: batch.id,

    //    // store RAW from device
 //       raw_code: rawCode,
        // optional (if you add later to DTO / mapping)
   //     raw_name: (it as any).name ?? null,
  //      raw_system: (it as any).system ?? null,

        // values
   //     value: it.value ?? null,
   //     unit: it.unit ?? null,
   //     flag: it.flag ?? null,

        // mapping FK (later)
        // sous_analyse_ref: null,
   //   });
   // });

   // if (items.length) {
   //   await this.itemRepo.save(items);
   // }

    //return { ok: true, batch_id: batch.id, inserted_items: items.length };
 // }


 async ingest(dto: IngestResultDto) {
  const receivedAt = new Date();

  const instrumentCode = (dto.instrument_code ?? '').toString().trim() || null;

  const batch = await this.batchRepo.save(
    this.batchRepo.create({
      barcode: dto.barcode,
      instrument_code: instrumentCode,
      raw_hl7: dto.raw_hl7 ?? null,
      received_at: receivedAt,
    }),
  );

  const incomingItems = dto.items ?? [];

  // Normalize codes first
  const normalizedCodes = incomingItems
    .map((it) => (it.code ?? '').toString().trim().toUpperCase())
    .filter((c) => c.length > 0);

  const uniqueCodes = [...new Set(normalizedCodes)];

 
  const mappings = instrumentCode && uniqueCodes.length
    ? await this.mapRepo.find({
        where: {
          instrument_code: instrumentCode,
          external_code: In(uniqueCodes),
          is_active: true,
        },
        order: { priority: 'DESC' },
      })
    : [];

 
  const mapByCode = new Map<string, SousAnalyseMap>();
  for (const m of mappings) {
  const code = (m.external_code ?? '').toString().trim().toUpperCase();
  if (!mapByCode.has(code)) {
    mapByCode.set(code, m);
  }
}

  const items = incomingItems.map((it) => {
    const rawCode = (it.code ?? '').toString().trim().toUpperCase();
    const mapping = mapByCode.get(rawCode);

    return this.itemRepo.create({
      batch_id: batch.id,
      raw_code: rawCode,

      
      raw_name: (it as any).name ?? null,
      raw_system: (it as any).system ?? null,

      value: it.value ?? null,
      unit: it.unit ?? null,
      flag: it.flag ?? null,

      // ✅ mapped FK (nullable)
      sous_analyse_ref_id: mapping?.sous_analyse_ref_id ?? null,
    });
  });

  if (items.length) await this.itemRepo.save(items);

  return {
    ok: true,
    batch_id: batch.id,
    inserted_items: items.length,
    mapped_items: items.filter((x) => x.sous_analyse_ref_id != null).length,
    instrument_code: instrumentCode,
  };
}

  async getLatestByBarcode(barcode: string) {
    const batch = await this.batchRepo.findOne({
      where: { barcode },
      order: { received_at: 'DESC' },
    });

    if (!batch) return null;

    const items = await this.itemRepo.find({
      where: { batch_id: batch.id },
      order: { raw_code: 'ASC' },
    });

    // Keep API stable for Flutter: return "code"
    return {
      barcode: batch.barcode,
      instrument_code: batch.instrument_code,
      received_at: batch.received_at,
      items: items.map((i) => ({
        code: i.raw_code,
        value: i.value,
        unit: i.unit,
        flag: i.flag,
      })),
    };
  }

  async getLatestEnrichedByBarcode(barcode: string) {
  const batch = await this.batchRepo.findOne({
    where: { barcode },
    order: { received_at: 'DESC' },
  });

  if (!batch) return null;

  const items = await this.itemRepo.find({
    where: { batch_id: batch.id },
    order: { raw_code: 'ASC' },
  });

  // Split mapped vs unmapped
  const mapped = items.filter((i) => i.sous_analyse_ref_id != null);
  const unmapped = items.filter((i) => i.sous_analyse_ref_id == null);

  // Load SousAnalyseRefs by FK
  const sousIds = [...new Set(mapped.map((i) => i.sous_analyse_ref_id as number))];

  const sousRefs = sousIds.length
    ? await this.sousRefRepo.find({ where: { sous_analyse_id: In(sousIds) } })
    : [];

  const sousById = new Map<number, SousAnalyseRef>(
    sousRefs.map((s) => [s.sous_analyse_id, s]),
  );

  // Load AnalyseRefs
  const analyseIds = [...new Set(sousRefs.map((s) => s.analyse_id))];
  const analyses = analyseIds.length
    ? await this.analyseRefRepo.find({ where: { analyse_id: In(analyseIds) } })
    : [];

  const analyseById = new Map<number, AnalyseRef>(
    analyses.map((a) => [a.analyse_id, a]),
  );

  // Group by analyse_id
  const groups = new Map<number, any>();

  for (const it of mapped) {
    const sousId = it.sous_analyse_ref_id as number;
    const sous = sousById.get(sousId);
    if (!sous) continue;

    const ana = analyseById.get(sous.analyse_id);

    if (!groups.has(sous.analyse_id)) {
      groups.set(sous.analyse_id, {
        analyse: ana
          ? { id: ana.analyse_id, code: ana.code, libelle: ana.libelle }
          : { id: sous.analyse_id, code: null, libelle: null },
        items: [],
      });
    }

    groups.get(sous.analyse_id).items.push({
      sous_analyse: {
        id: sous.sous_analyse_id,
        code: sous.code,
        libelle: sous.libelle,
        unit: sous.unit,
        data_type: sous.data_type,
      },
      raw: {
        code: it.raw_code,
        unit: it.unit,
        flag: it.flag,
        name: it.raw_name ?? null,
        system: it.raw_system ?? null,
      },
      value: it.value,
    });
  }

  return {
    barcode: batch.barcode,
    instrument_code: batch.instrument_code,
    received_at: batch.received_at,
    analyses: Array.from(groups.values()),
    unmapped_items: unmapped.map((it) => ({
      raw_code: it.raw_code,
      raw_name: it.raw_name ?? null,
      raw_system: it.raw_system ?? null,
      value: it.value,
      unit: it.unit,
      flag: it.flag,
    })),
  };
}

  async deleteOlderThan(hours: number) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

    const old = await this.batchRepo
      .createQueryBuilder('b')
      .select('b.id', 'id')
      .where('b.received_at < :cutoff', { cutoff: cutoff.toISOString() })
      .getRawMany<{ id: number }>();

    const ids = old.map((x) => x.id);
    if (!ids.length) return { deleted_batches: 0, deleted_items: 0, cutoff };

    const delItems = await this.itemRepo
      .createQueryBuilder()
      .delete()
      .from(ResultItem)
      .where('batch_id IN (:...ids)', { ids })
      .execute();

    const delBatches = await this.batchRepo
      .createQueryBuilder()
      .delete()
      .from(ResultBatch)
      .where('id IN (:...ids)', { ids })
      .execute();

    return {
      deleted_batches: delBatches.affected ?? 0,
      deleted_items: delItems.affected ?? 0,
      cutoff,
    };
  }
}