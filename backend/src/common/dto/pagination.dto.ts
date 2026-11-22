import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}

export class SearchPaginationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive match on email or name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export interface PageMeta {
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
}

export class Page<T> {
  readonly pagination: PageMeta;

  constructor(
    readonly items: T[],
    total: number,
    { limit, offset }: PaginationQueryDto,
  ) {
    this.pagination = {
      total,
      limit,
      offset,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }
}
