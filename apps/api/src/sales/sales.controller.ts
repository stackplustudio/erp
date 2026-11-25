import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateInvoiceDto,
  OverrideCreditLimitDto,
  VoidInvoiceDto,
} from './dto/create-invoice.dto';

function resolveTenant(req: any): string {
  return req.user?.tenantId || 'tenant_demo_fmcg_01';
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('invoices')
  @Roles(
    'SUPER_ADMIN',
    'OWNER',
    'FINANCE',
    'ORDER_CASHIER',
    'WAREHOUSE',
    'PURCHASING',
  )
  getInvoices(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const tenantId = resolveTenant(req);
    return this.salesService.getInvoices(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @Post('invoices')
  @Roles('SUPER_ADMIN', 'OWNER', 'ORDER_CASHIER')
  @HttpCode(HttpStatus.CREATED)
  createInvoice(@Request() req: any, @Body() dto: CreateInvoiceDto) {
    const tenantId = resolveTenant(req);
    return this.salesService.createInvoice(tenantId, req.user.sub, dto);
  }

  @Post('invoices/:id/override-limit')
  @Roles('SUPER_ADMIN', 'OWNER', 'ORDER_CASHIER')
  @HttpCode(HttpStatus.OK)
  overrideCreditLimit(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: OverrideCreditLimitDto,
  ) {
    const tenantId = resolveTenant(req);
    return this.salesService.overrideCreditLimit(
      tenantId,
      id,
      req.user.sub,
      dto,
    );
  }

  @Post('invoices/:id/void')
  @Roles('SUPER_ADMIN', 'OWNER', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  voidInvoice(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: VoidInvoiceDto,
  ) {
    const tenantId = resolveTenant(req);
    return this.salesService.voidInvoice(
      tenantId,
      id,
      req.user.sub,
      dto.reason,
    );
  }
}
