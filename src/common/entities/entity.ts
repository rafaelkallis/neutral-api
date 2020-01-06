/**
 * Entity
 */
export interface Entity {
  id: string;
  createdAt: number;
  updatedAt: number;

  /**
   *
   */
  equals(other: Entity): boolean;

  /**
   *
   */
  refresh(): Promise<void>;

  /**
   *
   */
  persist(): Promise<void>;
}
