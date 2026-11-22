import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { EmailTemplateType } from '../entities/email-template.entity.js';

const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class EmailTemplateInputDto {
  @ApiProperty({ enum: EmailTemplateType })
  @IsEnum(EmailTemplateType)
  type: EmailTemplateType;

  @ApiProperty({ example: 'Electoral Committee' })
  @Trim()
  @IsString()
  @Length(1, 100)
  fromName: string;

  @ApiProperty({ example: 'You are invited to vote in {{electionTitle}}' })
  @Trim()
  @IsString()
  @Length(1, 200)
  subject: string;

  @ApiProperty({
    example:
      'Hi {{voterName}},\n\nVoting opens {{startAt}}. Your code is {{otp}}.\n{{votingLink}}',
    description:
      'Placeholders: {{voterName}} {{voterEmail}} {{electionTitle}} {{otp}} {{votingLink}} {{startAt}} {{endAt}}',
  })
  @IsString()
  @Length(1, 10_000)
  body: string;
}

export class ReplaceEmailTemplatesDto {
  @ApiProperty({
    type: [EmailTemplateInputDto],
    description: 'At most one per type',
  })
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => EmailTemplateInputDto)
  templates: EmailTemplateInputDto[];
}
