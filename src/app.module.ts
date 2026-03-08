import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ResultatModule } from './resultat/resultat.module';
import { RefsModule } from './refs/refs.module';
import { SousAnalyseMapModule } from './mapping/sous-analyse-map.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'lab-gateway.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ScheduleModule.forRoot(),

    
    
    
    ResultatModule,

    
    
    
    RefsModule,
    SousAnalyseMapModule,
  ],
})
export class AppModule {}