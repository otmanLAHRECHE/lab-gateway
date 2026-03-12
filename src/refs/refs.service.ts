import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';

import { AnalyseRef } from './analyse-ref.entity';
import { SousAnalyseRef } from './sous-analyse-ref.entity';
import { AnalyseRefDto, SousAnalyseRefDto } from './dto/upsert-refs.dto';

@Injectable()
export class RefsService {
  constructor(
    @InjectRepository(AnalyseRef)
    private readonly analyseRepo: Repository<AnalyseRef>,

    @InjectRepository(SousAnalyseRef)
    private readonly sousRepo: Repository<SousAnalyseRef>,
  ) {}

  async upsertAnalyses(rows: AnalyseRefDto[]) {
    if (!rows?.length) return { upserted: 0 };

    await this.analyseRepo.upsert(
      rows.map((r) => ({
        analyse_id: r.analyse_id,
        code: r.code,
        libelle: r.libelle,
        domaine_analyse: r.domaine_analyse ?? null,
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
      ['code'],
    );

    return { upserted: rows.length };
  }

  findSousByCodes(codes: string[]) {
    if (!codes.length) return [];
    return this.sousRepo.find({
      where: codes.map((c) => ({ code: c })),
    });
  }

  findAnalysesByIds(ids: number[]) {
    if (!ids.length) return [];
    return this.analyseRepo.find({
      where: { analyse_id: In(ids) },
    });
  }

  async getAllAnalyses() {
    return this.analyseRepo.find({
      order: { analyse_id: 'ASC' },
    });
  }

  async getAllSousAnalyses(analyseId?: number) {
    if (analyseId) {
      return this.sousRepo.find({
        where: { analyse_id: analyseId },
        order: { analyse_id: 'ASC', sous_analyse_id: 'ASC' },
      });
    }

    return this.sousRepo.find({
      order: { analyse_id: 'ASC', sous_analyse_id: 'ASC' },
    });
  }

  async importFromFiles(params: { analysesCsv?: string; sousAnalysesCsv?: string }) {
    const { analysesCsv, sousAnalysesCsv } = params;

    let analyses: AnalyseRefDto[] = [];
    let sous: SousAnalyseRefDto[] = [];

    if (analysesCsv) {
      const records: any[] = parse(analysesCsv, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      analyses = records
        .map((r) => ({
          analyse_id: Number(r.analyse_id),
          code: String(r.code ?? '').trim(),
          libelle: String(r.libelle ?? '').trim(),
          domaine_analyse: r.domaine_analyse
            ? String(r.domaine_analyse).trim()
            : null,
        }))
        .filter((r) => r.analyse_id > 0 && r.code);
    }

    if (sousAnalysesCsv) {
      const records: any[] = parse(sousAnalysesCsv, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      sous = records
        .map((r) => ({
          sous_analyse_id: Number(r.sous_analyse_id),
          analyse_id: Number(r.analyse_id),
          code: String(r.code ?? '').trim(),
          libelle: String(r.libelle ?? '').trim(),
          unit: r.unit ? String(r.unit).trim() : null,
          data_type: r.data_type ? String(r.data_type).trim() : null,
        }))
        .filter((r) => r.sous_analyse_id > 0 && r.analyse_id > 0 && r.code);
    }

    if (!analyses.length && !sous.length) {
      throw new BadRequestException('CSV content empty or invalid format');
    }

    const a = analyses.length
      ? await this.upsertAnalyses(analyses)
      : { upserted: 0 };

    const s = sous.length
      ? await this.upsertSousAnalyses(sous)
      : { upserted: 0 };

    return { analyses: a, sous_analyses: s };
  }

  async importFromOneCsv(csv: string) {
    // Expected headers:
    // analyse_id,analyse_code,analyse_libelle,domaine_analyse,sous_analyse_id,sous_code,sous_libelle,unit,data_type

    const records: any[] = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records.length) {
      throw new BadRequestException('CSV is empty');
    }

    const analysesMap = new Map<number, AnalyseRefDto>();
    const sousAnalyses: SousAnalyseRefDto[] = [];

    for (const r of records) {
      const analyseId = Number(r.analyse_id);
      const analyseCode = String(r.analyse_code ?? '').trim();
      const analyseLib = String(r.analyse_libelle ?? '').trim();
      const domaineAnalyse = String(r.domaine_analyse ?? '').trim();

      const sousId = Number(r.sous_analyse_id);
      const sousCode = String(r.sous_code ?? '').trim();
      const sousLib = String(r.sous_libelle ?? '').trim();
      const unit = String(r.unit ?? '').trim();
      const dataType = String(r.data_type ?? '').trim();

      if (!analyseId || !analyseCode || !analyseLib) continue;
      if (!sousId || !sousCode || !sousLib) continue;

      if (!analysesMap.has(analyseId)) {
        analysesMap.set(analyseId, {
          analyse_id: analyseId,
          code: analyseCode,
          libelle: analyseLib,
          domaine_analyse: domaineAnalyse || null,
        });
      }

      sousAnalyses.push({
        sous_analyse_id: sousId,
        analyse_id: analyseId,
        code: sousCode,
        libelle: sousLib,
        unit: unit || null,
        data_type: dataType || null,
      });
    }

    const analyses = Array.from(analysesMap.values());

    if (!analyses.length && !sousAnalyses.length) {
      throw new BadRequestException('CSV format invalid or no valid rows');
    }

    const a = analyses.length
      ? await this.upsertAnalyses(analyses)
      : { upserted: 0 };

    const s = sousAnalyses.length
      ? await this.upsertSousAnalyses(sousAnalyses)
      : { upserted: 0 };

    return { analyses: a, sous_analyses: s };
  }
}