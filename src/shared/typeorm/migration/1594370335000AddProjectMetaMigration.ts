import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add project meta column.
 */
export class AddProjectMetaMigration1594370335000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN meta JSONB;

      UPDATE projects SET meta = '{}';
      
      ALTER TABLE projects ALTER COLUMN meta SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects DROP COLUMN meta;
    `);
  }
}
