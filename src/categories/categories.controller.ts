import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './schema/category.schema';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string): Promise<Category> {
    return this.categoriesService.findOne(name);
  }

  @Patch(':_id')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.NO_CONTENT || 204)
  update(
    @Param('_id') _id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    return this.categoriesService.update(_id, updateCategoryDto);
  }

  @Post('/:name/player/:_id')
  playersCategory(
    @Param('name') name: string,
    @Param('_id') _id: string,
  ): Promise<void> {
    return this.categoriesService.playersToCategory(name, _id);
  }

  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT || 204)
  delete(@Param('name') _id: string): Promise<void> {
    return this.categoriesService.delete(_id);
  }
}
