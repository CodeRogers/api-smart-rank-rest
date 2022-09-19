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
  Logger,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengeMachDto } from './dto/challenge-match.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeStatusValidation } from './pipes/challenge-status-validation.pipe';
import { Challenge } from './schemas/challenge.schema';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  private readonly logger = new Logger(ChallengesController.name);

  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() createChallengeDto: CreateChallengeDto,
  ): Promise<Challenge> {
    this.logger.log(
      `createChallengeDto: ${JSON.stringify(createChallengeDto)}`,
    );
    return await this.challengesService.create(createChallengeDto);
  }

  @Get()
  async findAll(@Query('player') _idPlayer?: string): Promise<Challenge[]> {
    return _idPlayer
      ? await this.challengesService.findPlayerChallenges(_idPlayer)
      : await this.challengesService.findAll();
  }

  @Get(':_id')
  async findOne(@Param('_id') _id: string): Promise<Challenge> {
    return await this.challengesService.findOne(_id);
  }

  @Patch(':_id')
  @HttpCode(HttpStatus.NO_CONTENT || 204)
  async update(
    @Param('_id') _id: string,
    @Body(ChallengeStatusValidation) updateChallengeDto: UpdateChallengeDto,
  ): Promise<void> {
    return await this.challengesService.update(_id, updateChallengeDto);
  }

  @Post('/:_id/match')
  async insertChallengeMatch(
    @Body(ValidationPipe) challengeMachDto: ChallengeMachDto,
    @Param('_id') _id: string,
  ) {
    return await this.challengesService.insertChallengeMatch(
      _id,
      challengeMachDto,
    );
  }

  @Delete(':_id')
  @HttpCode(HttpStatus.NO_CONTENT || 204)
  async delete(@Param('_id') _id: string): Promise<void> {
    return await this.challengesService.delete(_id);
  }
}
