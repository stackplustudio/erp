import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { PurchasingService } from './purchasing.service';
import { CreatePoDto } from './dto/create-po.dto';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';
import { PurchaseStatus } from '@prisma/client';

@Controller('purchasing')
@UseGuards(JwtAuthGuard)
export class PurchasingController {
  constructor(private readonly purchasingService: PurchasingService) {}

  private resolveTenant(user: AuthUser): string {
    return user.tenantId || 'tenant_demo_fmcg_01';
  }

  @Get('orders')
  getPurchaseOrders(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: PurchaseStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.purchasingService.getPurchaseOrders(
      this.resolveTenant(user),
      status,
      page,
      limit,
    );
  }

  @Post('orders')
  createPurchaseOrder(@CurrentUser() user: AuthUser, @Body() dto: CreatePoDto) {
    return this.purchasingService.createPurchaseOrder(
      this.resolveTenant(user),
      user.id,
      dto,
    );
  }

  @Post('orders/:id/receive')
  receiveGoods(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReceiveGoodsDto,
  ) {
    return this.purchasingService.receiveGoods(
      this.resolveTenant(user),
      user.id,
      id,
      dto,
    );
  }
}
