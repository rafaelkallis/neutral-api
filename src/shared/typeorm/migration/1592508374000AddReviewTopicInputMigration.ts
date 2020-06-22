import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add review topic input table.
 */
export class AddReviewTopicInputMigration1592508374000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE review_topics 
        ADD COLUMN input_type varchar(64),
        ADD COLUMN input_continuous_min integer,
        ADD COLUMN input_continuous_max integer,
        ADD COLUMN input_discrete_labels varchar(64)[],
        ADD COLUMN input_discrete_values integer[];

      UPDATE review_topics
        SET input_type = 'continuous',
            input_continuous_min = 0,
            input_continuous_max = 100;
      
      ALTER TABLE review_topics 
        ALTER COLUMN input_type SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE review_topics 
        DROP COLUMN input_type,
        DROP COLUMN input_continuous_min,
        DROP COLUMN input_continuous_max,
        DROP COLUMN input_discrete_labels,
        DROP COLUMN input_discrete_values;
    `);
  }
}
