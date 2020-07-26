import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add organizations table.
 */
export class AddOrganizationsMigration1595764704000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE organizations (
        id varchar(64) PRIMARY KEY,
        name varchar(128) NOT NULL UNIQUE,
        owner_id varchar(64) NOT NULL REFERENCES users(id),
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );

      CREATE UNIQUE INDEX organizations_owner_id_index
        ON organizations (owner_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX organizations_owner_id_index;

        DROP TABLE organizations;
    `);
  }
}
