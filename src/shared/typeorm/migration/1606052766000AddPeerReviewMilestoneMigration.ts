import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add peer review milestone.
 */
export class AddPeerReviewMilestoneMigration1606052766000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- projects in states: "peer-review", "manager-review" and "finished"
      -- 1) create milestone in "peer-review", "manager-review" or "finished" state, respectively
      -- 2) update to "active" state
      INSERT INTO milestones (id, project_id, title, description, state, created_at, updated_at) (
        SELECT 
          object_id(),
          id,
          'Milestone',
          '',
          state, 
          created_at,
          updated_at
        FROM projects
        WHERE state IN ('peer-review', 'manager-review', 'finished')
      );

      UPDATE projects
      SET state = 'active'
      WHERE state IN ('peer-review', 'manager-review', 'finished');

      -- projects in "archived" state
      -- 1) create milestone in "finished" state
      INSERT INTO milestones (id, project_id, title, description, state, created_at, updated_at) (
        SELECT 
          object_id(),
          id,
          'Milestone',
          '',
          'finished', 
          created_at,
          updated_at
        FROM projects
        WHERE state IN ('archived')
      );

      -- projects in "cancelled" state
      -- 1) create milestone in "cancelled" state
      INSERT INTO milestones (id, project_id, title, description, state, created_at, updated_at) (
        SELECT 
          object_id(),
          id,
          'Milestone',
          '',
          'cancelled', 
          created_at,
          updated_at
        FROM projects
        WHERE state IN ('cancelled')
      );

      ALTER TABLE peer_reviews
        ADD COLUMN milestone_id varchar(64) REFERENCES milestones(id);

      UPDATE peer_reviews
        SET milestone_id = milestones.id
        FROM milestones
        WHERE peer_reviews.project_id = milestones.project_id;

      ALTER TABLE peer_reviews
        ALTER COLUMN milestone_id SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE peer_reviews
        DROP COLUMN milestone_id;
    `);
  }
}
