import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rename "ownerId" to "creatorId" in Project
 */
export class RenameProjectOwnerToCreatorMigration1579969356000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects RENAME COLUMN owner_id TO creator_id;

      CREATE INDEX projects_creator_id_index
        ON projects (creator_id);
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX projects_creator_id_index;

      ALTER TABLE projects RENAME COLUMN creator_id TO owner_id;
    `);
  }
}
