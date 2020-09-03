import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add roles and peer reviews project_id index.
 */
export class AddAddRolesAndPeerReviewsProjectIdIndexesMigration1599128899000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX roles_project_id_index
        ON roles (project_id);
      
      CREATE INDEX peer_reviews_project_id_index
        ON peer_reviews (project_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX peer_reviews_project_id_index;

      DROP INDEX roles_project_id_index;
    `);
  }
}
