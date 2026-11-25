import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsNumber()
  @Min(0)
  actualQtyBase!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
