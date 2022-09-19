import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PlayersService } from 'src/players/players.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schema/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly playerService: PlayersService,
  ) {}

  private async idValidation(_id: string) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException({
        statusCode: 400,
        _id,
        message: 'id com formato inválido, nada encontrado',
      });
    return;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name } = createCategoryDto;
    const categoryFound = await this.categoryModel.findOne({ name });

    if (categoryFound)
      throw new BadRequestException(`Category '${name}' already exist`);

    const category = new this.categoryModel(createCategoryDto);
    const categoryCreated = await category.save();

    return categoryCreated;
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryModel.find().populate('players');
    return categories;
  }

  async findOne(name: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ name });
    if (!category) throw new NotFoundException(`Category '${name}' not found`);
    return category;
  }

  async update(
    _id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    await this.idValidation(_id);
    await this.categoryModel.findById(_id);
    await this.categoryModel.findOneAndUpdate(
      { _id },
      { $set: updateCategoryDto },
    );
  }

  async findPlayerCategory(_idPlayer: any): Promise<Category> {
    const jogadores = await this.playerService.findAll();
    await this.idValidation(_idPlayer);

    const jogadorFilter = jogadores.filter(
      (jogador) => jogador._id == _idPlayer,
    );

    if (jogadorFilter.length == 0) {
      throw new BadRequestException(`O id ${_idPlayer} não é um jogador!`);
    }

    return await this.categoryModel
      .findOne()
      .where('jogadores')
      .in(_idPlayer)
      .exec();
  }

  async playersToCategory(name: string, _idPlayer: string): Promise<void> {
    const category = await this.findOne(name);
    await this.idValidation(_idPlayer);
    const player = await this.playerService.findOne(_idPlayer);
    const playerCategory = await this.categoryModel.findOne({
      category,
      players: _idPlayer,
    });
    if (playerCategory)
      throw new BadRequestException({
        statusCode: 400,
        idPlayer: _idPlayer,
        message: `Este jogador já está cadastrado na categoria ${playerCategory.name}`,
      });
    category.players.push(player);
    await this.categoryModel.findOneAndUpdate({ name }, { $set: category });
  }

  async delete(name: string): Promise<void> {
    await this.findOne(name);
    await this.categoryModel.findOneAndDelete({ name });
  }
}
