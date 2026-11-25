import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentAllocationItemDto {
  @IsString()
  invoiceId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}

export class SettlePaymentDto {
  @IsString()
  customerId: string;

  @IsString()
  cashAccountId: string;

  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationItemDto)
  allocations: PaymentAllocationItemDto[];
}
