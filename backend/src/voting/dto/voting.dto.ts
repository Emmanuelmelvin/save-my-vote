import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class VoterCredentialsDto {
  @ApiProperty({ example: 'voter@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'K7P2QX',
    description: 'The one-time code from the invitation email',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s+/g, '').toUpperCase() : value,
  )
  @IsString()
  @Length(6, 6)
  otp: string;
}

export class SelectionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  positionId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  candidateId: string;
}

export class CastVoteDto extends VoterCredentialsDto {
  @ApiProperty({
    type: [SelectionDto],
    description: 'One choice per position on the ballot',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SelectionDto)
  selections: SelectionDto[];
}
