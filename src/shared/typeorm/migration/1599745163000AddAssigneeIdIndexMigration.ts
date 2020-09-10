import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add role assignee_id index.
 */
export class AddAssigneeIdIndexMigration1599745163000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX roles_assignee_id_index
        ON roles (assignee_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX roles_assignee_id_index;
    `);
  }
}
