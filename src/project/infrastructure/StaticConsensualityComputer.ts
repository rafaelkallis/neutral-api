import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';

@Injectable()
export class StaticConsensualityComputer extends ConsensualityComputer {
  protected doCompute(): Consensuality {
    return Consensuality.from(1);
  }
}
