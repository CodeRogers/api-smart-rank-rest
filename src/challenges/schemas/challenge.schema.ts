import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Player } from '../../players/schema/player.schema';
import { ChallengeStatus } from '../interfaces/challenge-status.enum';
import { Match } from './match.schema';

export type ChallengeDocument = Challenge & Document;

@Schema({ timestamps: true, collection: 'challenges' })
export class Challenge {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }] })
  players: Player[];

  @Prop()
  challengeDate: Date;

  @Prop()
  status: ChallengeStatus;

  @Prop()
  solicitationDate: Date;

  @Prop()
  responseDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Player' })
  challenger: Player;

  @Prop()
  category: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Match' })
  match: Match;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
