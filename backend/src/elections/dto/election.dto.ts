import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/** http(s) URLs or inline data:image/... values (uploads from the frontend), up to ~3 MB. */
export const IMAGE_SOURCE =
  /^(https?:\/\/\S+|data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+)$/;
export const IMAGE_MAX_LENGTH = 4_000_000;
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export class CreateElectionDto {
  @ApiProperty({ example: 'Student Union Elections 2027' })
  @Trim()
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiPropertyOptional({
    example: 'Annual election of the student union executive.',
  })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  startAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  endAt: Date;

  @ApiPropertyOptional({
    nullable: true,
    description: 'https URL or data:image/...;base64 value',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(IMAGE_MAX_LENGTH)
  @Matches(IMAGE_SOURCE, {
    message: 'logoUrl must be an http(s) URL or a base64 image',
  })
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: '#1050ff' })
  @IsOptional()
  @Matches(HEX_COLOR, {
    message: 'primaryColor must be a hex color like #1050ff',
  })
  primaryColor?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(IMAGE_MAX_LENGTH)
  @Matches(IMAGE_SOURCE, {
    message: 'heroImageUrl must be an http(s) URL or a base64 image',
  })
  heroImageUrl?: string | null;
}

export class UpdateElectionDto extends PartialType(CreateElectionDto) {}

export class ExtendElectionDto {
  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  endAt: Date;
}
