import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { PostgresDataTypes } from './postgres.types.enum';

export class FieldDto {
  @IsString()
  fieldName: string;

  @IsEnum(PostgresDataTypes)
  type: PostgresDataTypes;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  maxLength?: string;

  @IsString()
  @IsOptional()
  default?: string;

  @IsBoolean()
  nullable: boolean;

  @IsBoolean()
  unique: boolean;

  @IsBoolean()
  vectorEmbed: boolean;

  @IsString()
  @ValidateIf((o) => o.vectorEmbed === true)
  embeddingAlgo?: string;
}
