import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Events } from '../schema/category.schema';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  events: Array<Events>;
}
