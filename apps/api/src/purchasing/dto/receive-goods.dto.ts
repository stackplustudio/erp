import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiveItemDto {
  @IsString()
  @IsNotEmpty()
  poItemId!: string;

  @IsNumber()
  @Min(1)
  qtyReceived!: number;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsDateString()
  expiredDate?: string;
}

export class ReceiveGoodsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items!: ReceiveItemDto[];
}
