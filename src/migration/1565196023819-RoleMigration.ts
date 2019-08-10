import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Role migration
 */
export class RoleMigration1565196023819 implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE roles (
        id varchar(20) PRIMARY KEY,
        project_id varchar(20) NOT NULL REFERENCES projects(id),
        assignee_id varchar(20) REFERENCES users(id),
        title varchar(100) NOT NULL,
        description varchar(1024) NOT NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE roles;
    `);
  }
}
