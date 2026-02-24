import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyseRef } from './analyse-ref.entity';
import { SousAnalyseRef } from './sous-analyse-ref.entity';
import { RefsService } from './refs.service';
import { RefsController } from './refs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyseRef, SousAnalyseRef])],
  providers: [RefsService],
  controllers: [RefsController],
  exports: [RefsService],
})
export class RefsModule {}