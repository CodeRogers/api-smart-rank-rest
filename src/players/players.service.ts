import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player, PlayerDocument } from './schema/player.schema';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
  ) {}

  private readonly logger = new Logger(PlayersService.name);

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const emailFound = await this.playerModel.findOne({
      email: createPlayerDto.email,
    });
    if (emailFound)
      throw new BadRequestException(
        `Player with email ${createPlayerDto.email} already`,
      );

    try {
      const player = new this.playerModel(createPlayerDto);
      const playerCreated = await player.save();
      this.logger.log(`Player created: ${JSON.stringify(player)}`);
      return playerCreated;
    } catch (error) {
      if (error.code === 11000)
        throw new BadRequestException('Duplicate entry', error);
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<Player[]> {
    return await this.playerModel.find();
  }

  async findOne(_id: string): Promise<Player> {
    const player = await this.playerModel.findOne({ _id });
    if (!player)
      throw new NotFoundException(`Player with id: '${_id}' not found`);
    return player;
  }

  async update(_id: string, updatePlayerDto: UpdatePlayerDto): Promise<void> {
    await this.findOne(_id);

    const updatedPlayer = await this.playerModel.findOneAndUpdate(
      { _id },
      { $set: updatePlayerDto },
    );
    this.logger.log(
      `Player '${JSON.stringify(updatedPlayer)}' updated: '${JSON.stringify(
        updatePlayerDto,
      )}'`,
    );
    return;
  }

  async delete(_id: string): Promise<void> {
    await this.findOne(_id);

    await this.playerModel.deleteOne({ _id });
    this.logger.log(`Player with id: '${_id}' deleted`);
    return;
  }
}
