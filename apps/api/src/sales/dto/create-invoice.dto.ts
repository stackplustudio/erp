import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsPositive,
  IsInt,
  IsEnum,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class SalesInvoiceItemDto {
  @IsString()
  productUnitId: string;

  @IsInt()
  @IsPositive()
  qty: number;

  /** Harga jual per unit (dalam Rupiah, bilangan bulat) */
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @IsString()
  customerId: string;

  @IsString()
  warehouseId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  /** Tanggal jatuh tempo (ISO date string) */
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesInvoiceItemDto)
  items: SalesInvoiceItemDto[];
}

export class OverrideCreditLimitDto {
  @IsString()
  ownerPassword: string;

  @IsString()
  reason: string;
}

export class VoidInvoiceDto {
  @IsString()
  reason: string;
}
