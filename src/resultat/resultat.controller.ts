import { Body, Controller, Get, Post, Query, NotFoundException } from '@nestjs/common';
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
  async enriched(@Query('barcode') barcode: string) {
    const data = await this.service.getLatestEnrichedByBarcode(barcode);
    if (!data) throw new NotFoundException(`No execution found for barcode ${barcode}`);
    return data;
  }
}