import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Player } from 'src/players/schema/player.schema';

export class CreateChallengeDto {
  @IsNotEmpty()
  @IsDateString()
  challengeDate: Date;

  @IsNotEmpty()
  challenger: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  players: Array<Player>;
}
