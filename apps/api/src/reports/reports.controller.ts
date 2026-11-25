import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

function resolveTenant(req: any): string {
  return req.user?.tenantId || 'tenant_demo_fmcg_01';
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('gross-profit')
  @Roles('SUPER_ADMIN', 'OWNER', 'FINANCE')
  getGrossProfit(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getGrossProfitReport(
      resolveTenant(req),
      startDate,
      endDate,
    );
  }

  @Get('profit-loss')
  @Roles('SUPER_ADMIN', 'OWNER', 'FINANCE')
  getProfitLoss(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getProfitLossSummary(
      resolveTenant(req),
      startDate,
      endDate,
    );
  }
}
