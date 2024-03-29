import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add full name text search to users.
 */
export class UserAddFullNameTextSearchMigration1571300853000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [pgTrgmExtension] = await queryRunner.query(
      `select * from pg_available_extensions where name = 'pg_trgm';`,
    );
    if (!pgTrgmExtension || !pgTrgmExtension.installed_version) {
      throw new Error(
        `The postgres extension "pg_trgm" is not installed. An administrator should install the extension: "CREATE EXTENSION pg_trgm;"`,
      );
    }
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN full_name varchar(201);

      UPDATE users SET full_name = trim(
        coalesce(first_name, '') ||
        ' ' ||
        coalesce(last_name, '')
      );

      ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
      
      CREATE FUNCTION populate_full_name() RETURNS TRIGGER
      LANGUAGE plpgsql AS $populate_full_name$
      BEGIN
        NEW.full_name = trim(
          coalesce(NEW.first_name, '') ||
          ' ' ||
          coalesce(NEW.last_name, '')
        );
        RETURN NEW;
      END;
      $populate_full_name$;

      CREATE TRIGGER populate_full_name
      BEFORE INSERT OR UPDATE OF first_name, last_name
      ON users FOR EACH ROW
      EXECUTE PROCEDURE populate_full_name();

      -- CREATE EXTENSION IF NOT EXISTS pg_trgm;

      CREATE INDEX users_full_name_trgm_index ON users
      USING GIN(full_name gin_trgm_ops);
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX users_full_name_trgm_index;

      DROP TRIGGER populate_full_name ON users;

      DROP FUNCTION populate_full_name;

      ALTER TABLE users DROP COLUMN full_name;
    `);
  }
}
