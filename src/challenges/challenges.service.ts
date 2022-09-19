import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { PlayersService } from '../players/players.service';
import { ChallengeMachDto } from './dto/challenge-match.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
import { Challenge, ChallengeDocument } from './schemas/challenge.schema';
import { Match, MatchDocument } from './schemas/match.schema';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<ChallengeDocument>,
    @InjectModel(Match.name)
    private readonly matchModel: Model<MatchDocument>,
    private readonly playerService: PlayersService,
    private readonly categoryService: CategoriesService,
  ) {}

  private readonly logger = new Logger(ChallengesService.name);

  async create(createChallengeDto: CreateChallengeDto) {
    const players = await this.playerService.findAll();

    createChallengeDto.players.map((playerDto) => {
      const playerFilter = players.filter(
        (player) => player._id == playerDto._id,
      );
      if (playerFilter.length == 0)
        throw new BadRequestException(`O id ${playerDto._id} não é um jogador`);
    });

    const requesterIsPlayersMach = await createChallengeDto.players.filter(
      (player) => player._id == createChallengeDto.challenger,
    );

    if (requesterIsPlayersMach.length == 0) {
      throw new BadRequestException(
        'O solicitante deve ser um jogador da partida!',
      );
    }

    const playerCategory = await this.categoryService.findPlayerCategory(
      createChallengeDto.challenger,
    );

    if (!playerCategory) {
      throw new BadRequestException(
        `O Solicitante precisa estar registrado em uma categoria!`,
      );
    }

    const challenge = new this.challengeModel(createChallengeDto);
    challenge.category = playerCategory.name;
    challenge.solicitationDate = new Date();
    this.logger.log(
      `challengeCreated.solicitationDate: ${challenge.solicitationDate}`,
    );
    challenge.status = ChallengeStatus.PENDING;
    this.logger.log(`challengeCreated: ${JSON.stringify(challenge)}`);

    return await challenge.save();
  }

  async findAll() {
    const challenges = await this.challengeModel
      .find()
      .populate('challenger')
      .populate('players')
      .populate('match');
    return challenges;
  }

  async findPlayerChallenges(_idPlayer: string) {
    await this.playerService.findOne(_idPlayer);
    const challenges = await this.challengeModel
      .find({ players: _idPlayer })
      .populate('challenger')
      .populate('players')
      .populate('match');
    return challenges;
  }

  async findOne(_id: string) {
    const challenge = await this.challengeModel.findOne({ _id });
    if (!challenge) {
      throw new NotFoundException(`Challenge with id: ${_id} not found`);
    }
    return challenge;
  }

  async update(_id: string, updateChallengeDto: UpdateChallengeDto) {
    const challenge = await this.findOne(_id);

    if (updateChallengeDto.status) {
      challenge.responseDate = new Date();
    }

    challenge.status = updateChallengeDto.status;
    challenge.challengeDate = updateChallengeDto.challengeDate;

    await this.challengeModel.findOneAndUpdate(
      { _id },
      { $set: updateChallengeDto },
    );
  }

  async insertChallengeMatch(_id: string, challengeMachDto: ChallengeMachDto) {
    const challenge = await this.findOne(_id);

    const players = challenge.players.filter(
      (player) => player._id == challengeMachDto.winner,
    );

    if (players.length == 0) {
      throw new BadRequestException(`Player isn't part of this challenge`);
    }

    const match = new this.matchModel(challengeMachDto);

    match.category = challenge.category;

    match.players = challenge.players;

    const result = await match.save();

    challenge.status = ChallengeStatus.FINISHED;

    challenge.match = result;

    try {
      await this.challengeModel.findOneAndUpdate({ _id }, { $set: challenge });
    } catch (error) {
      await this.matchModel.deleteOne({ _id: result._id });
      throw new InternalServerErrorException();
    }
  }

  async delete(_id: string): Promise<void> {
    const challenge = await this.findOne(_id);

    challenge.status = ChallengeStatus.CANCELED;

    await this.challengeModel.findOneAndUpdate({ _id }, { $set: challenge });
  }
}
