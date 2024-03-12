import { Controller, Param, Post } from '@nestjs/common';
import { FieldDto } from './fields.dto';

@Controller('fields')
export class FieldsController {
    constructor()
    @Post()
    createModel(@Param('fields') field:FieldDto)
}
