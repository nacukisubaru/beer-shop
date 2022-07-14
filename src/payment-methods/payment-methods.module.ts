import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentMethod } from './payment-methods.model';

@Module({
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
  imports: [
    SequelizeModule.forFeature([PaymentMethod])
  ]
})
export class PaymentMethodsModule {}
