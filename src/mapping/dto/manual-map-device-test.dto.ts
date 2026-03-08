import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ManualMapDeviceTestDto {
  @IsInt()
  @Min(1)
  device_test_id: number;

  @IsInt()
  @Min(1)
  sous_analyse_ref_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @IsNotEmpty()
  external_system?: string | null;
}