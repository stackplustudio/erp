import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  @IsNotEmpty()
  priceTierId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditTermDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;
}
