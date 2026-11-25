import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class TransferStockDto {
  @IsString()
  @IsNotEmpty()
  fromWarehouseId!: string;

  @IsString()
  @IsNotEmpty()
  toWarehouseId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsNumber()
  @Min(1)
  qtyBase!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
