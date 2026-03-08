import { PartialType } from '@nestjs/mapped-types';
import { CreateSousAnalyseMapDto } from './create-sous-analyse-map.dto';

export class UpdateSousAnalyseMapDto extends PartialType(CreateSousAnalyseMapDto) {}