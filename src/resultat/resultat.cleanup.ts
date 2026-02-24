import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ResultatService } from './resultat.service';

@Injectable()
export class ResultatCleanup {
  constructor(private readonly service: ResultatService) {}

  @Cron('0 * * * *') // every hour
  cleanup() {
    return this.service.deleteOlderThan(24);
  }
}