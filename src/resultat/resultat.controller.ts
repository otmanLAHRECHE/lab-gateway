import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ResultatService } from './resultat.service';
import { IngestResultDto } from './dto/ingest-result.dto';

@Controller()
export class ResultatController {
  constructor(private readonly service: ResultatService) {}

  // Called by Mirth
  @Post('ingest/results')
  ingest(@Body() dto: IngestResultDto) {
    return this.service.ingest(dto);
  }

  // Called by Flutter Import button
  @Get('results')
  async getByBarcode(@Query('barcode') barcode?: string) {
    if (!barcode) return null;
    return this.service.getLatestByBarcode(barcode);
  }


  @Get('results/enriched')
getEnriched(@Query('barcode') barcode?: string) {
  if (!barcode) return null;
  return this.service.getLatestEnrichedByBarcode(barcode);
}
}