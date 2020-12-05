import { MilestoneState } from 'project/domain/milestone/value-objects/states/MilestoneState';

export class CancelledMilestoneState extends MilestoneState {
  public static readonly INSTANCE: MilestoneState = new CancelledMilestoneState();

  public isTerminal(): boolean {
    return true;
  }

  protected getOrdinal(): number {
    return -1;
  }

  private constructor() {
    super();
  }
}
