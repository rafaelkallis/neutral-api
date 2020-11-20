import { Model, ReadonlyModel } from 'shared/domain/Model';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Class } from 'shared/domain/Class';
import { MilestoneId } from './value-objects/MilestoneId';
import { MilestoneTitle } from './value-objects/MilestoneTitle';
import { MilestoneDescription } from './value-objects/MilestoneDescription';

export interface ReadonlyMilestone extends ReadonlyModel<MilestoneId> {
  readonly title: MilestoneTitle;
  readonly description: MilestoneDescription;
}

export class Milestone extends Model<MilestoneId> implements ReadonlyMilestone {
  public title: MilestoneTitle;
  public description: MilestoneDescription;

  public constructor(
    id: MilestoneId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: MilestoneTitle,
    description: MilestoneDescription,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
  }

  /**
   *
   */
  public static of(
    title: MilestoneTitle,
    description: MilestoneDescription,
  ): Milestone {
    const id = MilestoneId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    return new Milestone(id, createdAt, updatedAt, title, description);
  }

  public getClass(): Class<Milestone> {
    return Milestone;
  }
}
