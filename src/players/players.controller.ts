import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { ValidateParamPipe } from '../common/pipes/param-validate.pipe';
import { PlayersService } from './players.service';
import { Player } from './schema/player.schema';

@Controller('players')
export class PlayersController {
  constructor(private readonly playerService: PlayersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() createPlayerDto: CreatePlayerDto): Promise<Player> {
    return await this.playerService.create(createPlayerDto);
  }

  @Get()
  async findAll(
    @Query('email') email: string,
    @Query('name') name: string,
  ): Promise<Player[]> {
    let players = await this.playerService.findAll();

    if (email) players = players.filter((player) => player.email === email);
    if (name) players = players.filter((player) => player.name === name);

    return players;
  }

  @Get('/:_id')
  async findOne(@Param('_id', ValidateParamPipe) _id: string): Promise<Player> {
    return await this.playerService.findOne(_id);
  }

  @Patch('/:_id')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.NO_CONTENT || 204)
  async update(
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Param('_id', ValidateParamPipe) _id: string,
  ): Promise<void> {
    await this.playerService.update(_id, updatePlayerDto);
  }

  @Delete('/:_id')
  @HttpCode(HttpStatus.NO_CONTENT || 204)
  async delete(@Param('_id', ValidateParamPipe) _id: string): Promise<void> {
    await this.playerService.delete(_id);
  }
}
