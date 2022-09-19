import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ChallengeStatus } from '../interfaces/challenge-status.enum';

export class ChallengeStatusValidation implements PipeTransform {
  readonly statusPermintidos = [
    ChallengeStatus.ACCEPTED,
    ChallengeStatus.DECLINED,
    ChallengeStatus.CANCELED,
  ];

  transform(value: any) {
    const status = value.status.toUpperCase();

    if (!this.isValidStatus(status)) {
      throw new BadRequestException(`Status inválido: ${status}`);
    }

    return { ...value, status };
  }

  private isValidStatus(status: any) {
    const idx = this.statusPermintidos.indexOf(status);
    return idx !== -1;
  }
}
