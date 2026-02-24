import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyseRef } from './analyse-ref.entity';
import { SousAnalyseRef } from './sous-analyse-ref.entity';
import { AnalyseRefDto, SousAnalyseRefDto } from './dto/upsert-refs.dto';

@Injectable()
export class RefsService {
  constructor(
    @InjectRepository(AnalyseRef) private readonly analyseRepo: Repository<AnalyseRef>,
    @InjectRepository(SousAnalyseRef) private readonly sousRepo: Repository<SousAnalyseRef>,
  ) {}

  async upsertAnalyses(rows: AnalyseRefDto[]) {
    if (!rows?.length) return { upserted: 0 };

    await this.analyseRepo.upsert(
      rows.map((r) => ({
        analyse_id: r.analyse_id,
        code: r.code,
        libelle: r.libelle,
      })),
      ['analyse_id'],
    );

    return { upserted: rows.length };
  }

  async upsertSousAnalyses(rows: SousAnalyseRefDto[]) {
    if (!rows?.length) return { upserted: 0 };

    await this.sousRepo.upsert(
      rows.map((r) => ({
        sous_analyse_id: r.sous_analyse_id,
        analyse_id: r.analyse_id,
        code: r.code,
        libelle: r.libelle,
        unit: r.unit ?? null,
        data_type: r.data_type ?? null,
      })),
      ['sous_analyse_id'],
    );

    return { upserted: rows.length };
  }

  // Lookup by code (for enrichment)
  findSousByCodes(codes: string[]) {
    if (!codes.length) return [];
    return this.sousRepo.find({ where: codes.map((c) => ({ code: c })) });
  }

  findAnalysesByIds(ids: number[]) {
    if (!ids.length) return [];
    return this.analyseRepo.findByIds(ids as any);
  }
}