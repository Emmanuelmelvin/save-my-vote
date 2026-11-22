import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IMAGE_MAX_LENGTH, IMAGE_SOURCE } from './election.dto.js';

const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CandidateInputDto {
  @ApiProperty({ example: 'Grace Hopper' })
  @Trim()
  @IsString()
  @Length(1, 150)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'https URL or data:image/...;base64 value',
  })
  @IsOptional()
  @IsString()
  @MaxLength(IMAGE_MAX_LENGTH)
  @Matches(IMAGE_SOURCE, {
    message: 'photoUrl must be an http(s) URL or a base64 image',
  })
  photoUrl?: string;
}

export class PositionInputDto {
  @ApiProperty({ example: 'President' })
  @Trim()
  @IsString()
  @Length(1, 150)
  title: string;

  @ApiProperty({ type: [CandidateInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CandidateInputDto)
  candidates: CandidateInputDto[];
}

/** The whole ballot, in display order. Replaces whatever was there before. */
export class ReplaceBallotDto {
  @ApiProperty({ type: [PositionInputDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => PositionInputDto)
  positions: PositionInputDto[];
}
