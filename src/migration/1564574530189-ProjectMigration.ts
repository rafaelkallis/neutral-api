import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectMigration1564574530189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      CREATE TABLE projects (
        id varchar(20) PRIMARY KEY,
        title varchar(100) NOT NULL,
        description varchar(1024) NOT NULL,
        owner_id varchar(20) NOT NULL REFERENCES users(id),
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      DROP TABLE projects;
    `);
  }
}
