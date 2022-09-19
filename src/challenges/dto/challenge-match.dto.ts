import { IsNotEmpty } from 'class-validator';
import { Result } from '../interfaces/match.interface';

export class ChallengeMachDto {
  @IsNotEmpty()
  winner: string;

  @IsNotEmpty()
  result: Result[];
}
