import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeviceTestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  external_code: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  external_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  external_system?: string;
}

export class BootstrapDeviceTestsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  instrument_code: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeviceTestDto)
  tests: DeviceTestDto[];
}