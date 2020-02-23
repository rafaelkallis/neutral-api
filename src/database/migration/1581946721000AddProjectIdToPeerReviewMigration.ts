import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add peer review visibility to projects.
 */
export class AddProjectIdToPeerReviewMigration1581946721000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE peer_reviews ADD COLUMN project_id varchar(255);

      UPDATE peer_reviews
        SET project_id = roles.project_id
        FROM roles
        WHERE roles.id = peer_reviews.sender_role_id;

      ALTER TABLE peer_reviews ALTER COLUMN project_id SET not null;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE peer_reviews DROP COLUMN project_id;
    `);
  }
}
