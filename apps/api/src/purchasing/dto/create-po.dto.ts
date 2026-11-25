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

export class PoItemInputDto {
  @IsString()
  @IsNotEmpty()
  productUnitId!: string;

  @IsNumber()
  @Min(1)
  qtyOrdered!: number;

  @IsNumber()
  @Min(0)
  unitCost!: number;
}

export class CreatePoDto {
  @IsString()
  @IsNotEmpty()
  supplierId!: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PoItemInputDto)
  items!: PoItemInputDto[];
}
