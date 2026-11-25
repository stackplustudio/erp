import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { InventoryService } from './inventory.service';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  private resolveTenant(user: AuthUser): string {
    return user.tenantId || 'tenant_demo_fmcg_01';
  }

  @Get('stocks')
  getStocks(
    @CurrentUser() user: AuthUser,
    @Query('warehouseId') warehouseId?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.inventoryService.getStocks(
      this.resolveTenant(user),
      warehouseId,
      search,
      page,
      limit,
      user.role,
    );
  }

  @Get('movements')
  getMovements(
    @CurrentUser() user: AuthUser,
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.inventoryService.getMovements(
      this.resolveTenant(user),
      warehouseId,
      productId,
      page,
      limit,
      user.role,
    );
  }

  @Get('batches')
  getBatches(
    @CurrentUser() user: AuthUser,
    @Query('productId') productId?: string,
  ) {
    return this.inventoryService.getBatches(
      this.resolveTenant(user),
      productId,
    );
  }

  @Post('transfer')
  transferStock(@CurrentUser() user: AuthUser, @Body() dto: TransferStockDto) {
    return this.inventoryService.transferStock(
      this.resolveTenant(user),
      user.id,
      dto,
    );
  }

  @Post('adjustment')
  adjustStock(@CurrentUser() user: AuthUser, @Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(
      this.resolveTenant(user),
      user.id,
      dto,
    );
  }
}
