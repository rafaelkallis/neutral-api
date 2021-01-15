import { MilestoneState } from 'project/domain/milestone/value-objects/states/MilestoneState';

export class FinishedMilestoneState extends MilestoneState {
  public static readonly INSTANCE: MilestoneState = new FinishedMilestoneState();

  private constructor() {
    super();
  }

  public isTerminal(): boolean {
    return true;
  }

  protected getOrdinal(): number {
    return 3;
  }
}
