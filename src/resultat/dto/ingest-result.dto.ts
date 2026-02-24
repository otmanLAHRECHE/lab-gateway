import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IngestItemDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  value?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  flag?: string | null;
}

export class IngestResultDto {
  @IsString()
  @MaxLength(64)
  barcode: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  instrument_code?: string;

  @IsOptional()
  @IsString()
  raw_hl7?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngestItemDto)
  items: IngestItemDto[];
}