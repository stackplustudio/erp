import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SettlePaymentDto } from './dto/settle-payment.dto';

function resolveTenant(req: any): string {
  return req.user?.tenantId || 'tenant_demo_fmcg_01';
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('cash-accounts')
  @Roles('SUPER_ADMIN', 'OWNER', 'FINANCE')
  getCashAccounts(@Request() req: any) {
    return this.financeService.getCashAccounts(resolveTenant(req));
  }

  @Get('cash-mutations')
  @Roles('SUPER_ADMIN', 'OWNER', 'FINANCE')
  getCashMutations(
    @Request() req: any,
    @Query('cashAccountId') cashAccountId?: string,
    @Query('page') page?: string,
  ) {
    return this.financeService.getCashMutations(
      resolveTenant(req),
      cashAccountId,
      page ? parseInt(page) : 1,
    );
  }

  @Post('payments')
  @Roles('SUPER_ADMIN', 'OWNER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  settlePayment(@Request() req: any, @Body() dto: SettlePaymentDto) {
    return this.financeService.settlePayment(
      resolveTenant(req),
      req.user.sub,
      dto,
    );
  }

  @Get('aging')
  @Roles('SUPER_ADMIN', 'OWNER', 'FINANCE')
  getAgingReport(@Request() req: any) {
    return this.financeService.getAgingReport(resolveTenant(req));
  }

  @Get('invoices/unpaid')
  @Roles('SUPER_ADMIN', 'OWNER', 'FINANCE')
  getUnpaidInvoices(
    @Request() req: any,
    @Query('customerId') customerId: string,
  ) {
    return this.financeService.getUnpaidInvoicesByCustomer(
      resolveTenant(req),
      customerId,
    );
  }
}
