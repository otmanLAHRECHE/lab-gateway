import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultatService } from './resultat.service';
import { ResultatController } from './resultat.controller';
import { ResultBatch } from './result-batch.entity';
import { ResultItem } from './result-item.entity';
import { ResultatCleanup } from './resultat.cleanup';
import { In } from 'typeorm';
import { SousAnalyseRef } from '../refs/sous-analyse-ref.entity';
import { AnalyseRef } from '../refs/analyse-ref.entity';
import { SousAnalyseMap } from '../mapping/sous-analyse-map.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResultBatch,
      ResultItem,
      SousAnalyseRef,
      AnalyseRef,
      SousAnalyseMap, 
    ]),
  ],
  providers: [ResultatService],
  controllers: [ResultatController],
})
export class ResultatModule {}