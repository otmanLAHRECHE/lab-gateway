import { Body, Controller, Post } from '@nestjs/common';
import { RefsService } from './refs.service';
import { UpsertAnalysesDto, UpsertSousAnalysesDto } from './dto/upsert-refs.dto';

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
}