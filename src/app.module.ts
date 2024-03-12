import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FieldsService } from './fields/fields.service';
import { FieldsController } from './fields/fields.controller';

@Module({
  imports: [],
  controllers: [AppController, FieldsController],
  providers: [AppService, FieldsService],
})
export class AppModule {}
