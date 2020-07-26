import {
  DefaultOrdinalProjectState,
  OrdinalProjectState,
} from './OrdinalProjectState';

export class ArchivedProjectState extends DefaultOrdinalProjectState {
  public static readonly INSTANCE: OrdinalProjectState = new ArchivedProjectState();

  public getOrdinal(): number {
    return 4;
  }

  private constructor() {
    super();
  }
}
