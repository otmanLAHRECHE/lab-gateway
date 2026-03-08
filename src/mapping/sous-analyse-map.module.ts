import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SousAnalyseMap } from './sous-analyse-map.entity';
import { SousAnalyseRef } from '../refs/sous-analyse-ref.entity';
import { DeviceAvailableTest } from './device-available-test.entity';
import { SousAnalyseMapService } from './sous-analyse-map.service';
import { SousAnalyseMapController } from './sous-analyse-map.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SousAnalyseMap,
      SousAnalyseRef,
      DeviceAvailableTest,
    ]),
  ],
  providers: [SousAnalyseMapService],
  controllers: [SousAnalyseMapController],
  exports: [SousAnalyseMapService],
})
export class SousAnalyseMapModule {}