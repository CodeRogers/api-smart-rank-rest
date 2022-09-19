import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Player } from '../../players/schema/player.schema';
import { Result } from '../interfaces/match.interface';

export type MatchDocument = Match & Document;

@Schema({ timestamps: true, collection: 'matches' })
export class Match {
  @Prop()
  category: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }] })
  players: Player[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Player' })
  winner: Player;

  @Prop()
  result: Result[];
}

export const MachSchema = SchemaFactory.createForClass(Match);
