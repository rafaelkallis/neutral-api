import { Column } from 'typeorm';

export class ReviewTopicInputTypeOrmEntity {
  @Column({ name: 'input_type', type: 'varchar' })
  public readonly type: string;

  @Column({ name: 'input_continuous_min', type: 'integer', nullable: true })
  public readonly continuousMin: number | null;

  @Column({ name: 'input_continuous_max', type: 'integer', nullable: true })
  public readonly continuousMax: number | null;

  @Column({
    name: 'input_discrete_labels',
    type: 'varchar',
    array: true,
    nullable: true,
  })
  public readonly discreteLabels: string[] | null;

  @Column({
    name: 'input_discrete_values',
    type: 'integer',
    array: true,
    nullable: true,
  })
  public readonly discreteValues: number[] | null;

  public constructor(
    type: string,
    continuousMin: number | null,
    continuousMax: number | null,
    discreteLabels: string[] | null,
    discreteValues: number[] | null,
  ) {
    this.type = type;
    this.continuousMin = continuousMin;
    this.continuousMax = continuousMax;
    this.discreteLabels = discreteLabels;
    this.discreteValues = discreteValues;
  }
}
