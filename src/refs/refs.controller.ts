import { Body, Controller, Get, Post, UseInterceptors, BadRequestException, UploadedFiles, Query,UploadedFile } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RefsService } from './refs.service';
import { UpsertAnalysesDto, UpsertSousAnalysesDto } from './dto/upsert-refs.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('refs')
export class RefsController {
  constructor(private readonly service: RefsService) {}

  @Post('analyses')
  upsertAnalyses(@Body() dto: UpsertAnalysesDto) {
    return this.service.upsertAnalyses(dto.analyses);
  }

  @Post('sous-analyses')
  upsertSousAnalyses(@Body() dto: UpsertSousAnalysesDto) {
    return this.service.upsertSousAnalyses(dto.sous_analyses);
  }

  @Post('import')
async importRefs(
  @Body() body: { analyses?: any[]; sous_analyses?: any[] },
) {
  const analyses = body.analyses ?? [];
  const sous = body.sous_analyses ?? [];

  const a = analyses.length ? await this.service.upsertAnalyses(analyses ) : { inserted: 0, updated: 0 };
  const s = sous.length ? await this.service.upsertSousAnalyses(sous) : { inserted: 0, updated: 0 };

  return {
    ok: true,
    analyses: a,
    sous_analyses: s,
  };
}


@Post('import-file')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'analysesFile', maxCount: 1 },
  { name: 'sousAnalysesFile', maxCount: 1 },
]))
async importFile(
  @UploadedFiles() files: { analysesFile?: Express.Multer.File[]; sousAnalysesFile?: Express.Multer.File[] },
) {
  const aFile = files.analysesFile?.[0];
  const sFile = files.sousAnalysesFile?.[0];

  if (!aFile && !sFile) throw new BadRequestException('Upload at least one file');

  const result = await this.service.importFromFiles({
    analysesCsv: aFile?.buffer?.toString('utf-8'),
    sousAnalysesCsv: sFile?.buffer?.toString('utf-8'),
  });

  return { ok: true, ...result };
}


@Get('analyses')
getAnalyses() {
  return this.service.getAllAnalyses();
}


@Get('sous-analyses')
getSousAnalyses(@Query('analyse_id') analyseId?: string) {
  // optional filter by analyse_id
  const id = analyseId ? Number(analyseId) : undefined;
  return this.service.getAllSousAnalyses(id);
}


@Post('import-one-csv')
@UseInterceptors(FileInterceptor('refsFile'))
async importOneCsv(@UploadedFile() file: Express.Multer.File) {
  if (!file) throw new BadRequestException('refsFile is required');

  const csvContent = file.buffer.toString('utf-8');
  const result = await this.service.importFromOneCsv(csvContent);

  return { ok: true, ...result };
}


}