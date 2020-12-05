import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add contribution milestone.
 */
export class AddContributionMilestoneMigration1606589847000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE contributions
        ADD COLUMN milestone_id varchar(64) REFERENCES milestones(id);

      UPDATE contributions
        SET milestone_id = milestones.id
        FROM milestones
        WHERE contributions.project_id = milestones.project_id;

      ALTER TABLE contributions
        ALTER COLUMN milestone_id SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE contributions
        DROP COLUMN milestone_id;
    `);
  }
}
