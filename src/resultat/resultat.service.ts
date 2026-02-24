import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultBatch } from './result-batch.entity';
import { ResultItem } from './result-item.entity';
import { IngestResultDto } from './dto/ingest-result.dto';
import { In } from 'typeorm';
import { SousAnalyseRef } from '../refs/sous-analyse-ref.entity';
import { AnalyseRef } from '../refs/analyse-ref.entity';

@Injectable()
export class ResultatService {
  constructor(
  @InjectRepository(ResultBatch) private readonly batchRepo: Repository<ResultBatch>,
  @InjectRepository(ResultItem) private readonly itemRepo: Repository<ResultItem>,
  @InjectRepository(SousAnalyseRef) private readonly sousRefRepo: Repository<SousAnalyseRef>,
  @InjectRepository(AnalyseRef) private readonly analyseRefRepo: Repository<AnalyseRef>,
) {}

  async ingest(dto: IngestResultDto) {
    const receivedAt = new Date();

    // Create a new batch each time (simple + safe)
    const batch = await this.batchRepo.save(
      this.batchRepo.create({
        barcode: dto.barcode,
        instrument_code: dto.instrument_code ?? null,
        raw_hl7: dto.raw_hl7 ?? null,
        received_at: receivedAt,
      }),
    );

    const items = dto.items.map((it) =>
      this.itemRepo.create({
        batch_id: batch.id,
        code: it.code,
        value: it.value ?? null,
        unit: it.unit ?? null,
        flag: it.flag ?? null,
      }),
    );

    if (items.length) await this.itemRepo.save(items);

    return { ok: true, batch_id: batch.id, inserted_items: items.length };
  }

  async getLatestByBarcode(barcode: string) {
    const batch = await this.batchRepo.findOne({
      where: { barcode },
      order: { received_at: 'DESC' },
    });

    if (!batch) return null;

    const items = await this.itemRepo.find({
      where: { batch_id: batch.id },
      order: { code: 'ASC' },
    });

    return {
      barcode: batch.barcode,
      instrument_code: batch.instrument_code,
      received_at: batch.received_at,
      items: items.map((i) => ({
        code: i.code,
        value: i.value,
        unit: i.unit,
        flag: i.flag,
      })),
    };
  }

  async deleteOlderThan(hours: number) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Find old batch ids
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

  async getLatestEnrichedByBarcode(barcode: string) {
  const batch = await this.batchRepo.findOne({
    where: { barcode },
    order: { received_at: 'DESC' },
  });
  if (!batch) return null;

  const items = await this.itemRepo.find({
    where: { batch_id: batch.id },
    order: { code: 'ASC' },
  });

  const codes = items.map((i) => i.code).filter(Boolean);
  const sousRefs = codes.length
    ? await this.sousRefRepo.find({ where: { code: In(codes) } })
    : [];

  const sousByCode = new Map(sousRefs.map((s) => [s.code, s]));
  const analyseIds = [...new Set(sousRefs.map((s) => s.analyse_id))];

  const analyses = analyseIds.length
    ? await this.analyseRefRepo.find({ where: { analyse_id: In(analyseIds) } })
    : [];

  const analyseById = new Map(analyses.map((a) => [a.analyse_id, a]));

  return {
    barcode: batch.barcode,
    instrument_code: batch.instrument_code,
    received_at: batch.received_at,
    items: items.map((i) => {
      const sous = sousByCode.get(i.code);
      const ana = sous ? analyseById.get(sous.analyse_id) : undefined;

      return {
        code: i.code,
        value: i.value,
        unit: i.unit,
        flag: i.flag,

        sous_analyse: sous
          ? { id: sous.sous_analyse_id, libelle: sous.libelle, unit: sous.unit, data_type: sous.data_type }
          : null,

        analyse: ana ? { id: ana.analyse_id, libelle: ana.libelle, code: ana.code } : null,
      };
    }),
  };
}
}