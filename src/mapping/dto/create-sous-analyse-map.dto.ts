import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSousAnalyseMapDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  instrument_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  external_code: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  external_system?: string;

  @IsInt()
  @Min(1)
  sous_analyse_ref_id: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}