import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SousAnalyseMapService } from './sous-analyse-map.service';
import { CreateSousAnalyseMapDto } from './dto/create-sous-analyse-map.dto';
import { UpdateSousAnalyseMapDto } from './dto/update-sous-analyse-map.dto';
import { Query } from '@nestjs/common';
import { BootstrapDeviceTestsDto } from './dto/bootstrap-device-tests.dto';
import { ManualMapDeviceTestDto } from './dto/manual-map-device-test.dto';

@Controller('sous-analyse-map')
export class SousAnalyseMapController {
  constructor(private readonly service: SousAnalyseMapService) {}

  @Post()
  create(@Body() dto: CreateSousAnalyseMapDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('device-tests-all')
getAllDeviceTests(
  @Query('instrument_code') instrumentCode?: string,
  @Query('is_mapped') isMapped?: string,
) {
  const mapped =
    isMapped === undefined ? undefined : isMapped === 'true';

  return this.service.getAllDeviceTests(instrumentCode, mapped);
}


@Post('manual-map')
manualMap(@Body() dto: ManualMapDeviceTestDto) {
  return this.service.manualMapDeviceTest(
    dto.device_test_id,
    dto.sous_analyse_ref_id,
    dto.external_system,
  );
}


  @Get('device-tests')
  getDeviceTests(
    @Query('instrument_code') instrumentCode: string,
    @Query('is_mapped') isMapped?: string,
  ) {
    const mapped =
      isMapped === undefined ? undefined : isMapped === 'true';
    return this.service.getDeviceTests(instrumentCode, mapped);
  }




  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSousAnalyseMapDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }



  @Post('bootstrap-from-device')
  bootstrapFromDevice(@Body() dto: BootstrapDeviceTestsDto) {
    return this.service.bootstrapFromDevice(dto);
  }

  



}