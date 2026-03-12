import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyseRefDto {
  @IsInt()
  analyse_id: number;

  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(255)
  libelle: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  domaine_analyse?: string | null;
}

export class SousAnalyseRefDto {
  @IsInt()
  sous_analyse_id: number;

  @IsInt()
  analyse_id: number;

  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(255)
  libelle: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  data_type?: string | null;
}

export class UpsertAnalysesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnalyseRefDto)
  analyses: AnalyseRefDto[];
}

export class UpsertSousAnalysesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SousAnalyseRefDto)
  sous_analyses: SousAnalyseRefDto[];
}