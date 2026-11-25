import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductUnitInputDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(1)
  factorToBase!: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsBoolean()
  isBase?: boolean;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  @IsNotEmpty()
  baseUnitName!: string;

  @IsOptional()
  @IsBoolean()
  trackBatch?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockAlert?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductUnitInputDto)
  units!: ProductUnitInputDto[];
}
