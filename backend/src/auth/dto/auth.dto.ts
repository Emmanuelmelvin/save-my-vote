import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsJWT,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OrganizationType } from '../../users/user.entity.js';

const NormalizeEmail = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class EmailDto {
  @ApiProperty({ example: 'ada@example.com' })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(255)
  email: string;
}

export class SignUpDto extends EmailDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @Trim()
  @IsString()
  @Length(2, 100)
  fullName: string;

  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({ enum: OrganizationType })
  @IsOptional()
  @IsEnum(OrganizationType)
  organizationType?: OrganizationType;

  @ApiPropertyOptional({ example: 'University of Lagos' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(1, 200)
  organizationName?: string;
}

export class LoginDto extends EmailDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token from the reset link' })
  @IsJWT()
  token: string;

  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty()
  @IsString()
  passwordConfirm: string;
}
