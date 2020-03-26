import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add peer reviews table and remove peer reviews attribute from role.
 */
export class AddPeerReviewsMigration1573718439000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE peer_reviews (
        id varchar(64) PRIMARY KEY,
        reviewer_role_id varchar(64) NOT NULL REFERENCES roles(id),
        reviewee_role_id varchar(64) NOT NULL REFERENCES roles(id),
        score real NOT NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL
      );

      CREATE INDEX peer_reviews_reviewer_role_id_index
        ON peer_reviews (reviewer_role_id);

      CREATE FUNCTION object_id() 
        RETURNS varchar AS $object_id$
        DECLARE
          time_component bigint;
          machine_id bigint := FLOOR(random() * 16777215);
          process_id bigint;
          seq_id bigint := FLOOR(random() * 16777215);
          result varchar:= '';
        BEGIN
          SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp())) INTO time_component;
          SELECT pg_backend_pid() INTO process_id;

          result := result || lpad(to_hex(time_component), 8, '0');
          result := result || lpad(to_hex(machine_id), 6, '0');
          result := result || lpad(to_hex(process_id), 4, '0');
          result := result || lpad(to_hex(seq_id), 6, '0');
          RETURN result;
        END;
      $object_id$ LANGUAGE PLPGSQL;

      INSERT INTO peer_reviews (
        SELECT object_id(), id, key, value::real, created_at, updated_at
        FROM roles, jsonb_each_text(peer_reviews)
      );

      ALTER TABLE roles DROP COLUMN peer_reviews;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles ADD COLUMN peer_reviews jsonb;

      DROP FUNCTION object_id();

      UPDATE roles 
        SET peer_reviews = pr.json_peer_reviews
        FROM (
          SELECT 
            reviewer_role_id,
            jsonb_object_agg(
              reviewee_role_id, 
              score
            ) as json_peer_reviews
          FROM peer_reviews
          GROUP BY reviewer_role_id
        ) as pr
        WHERE roles.id = pr.reviewer_role_id;
        
      DROP INDEX peer_reviews_reviewer_role_id_index;
      
      DROP TABLE peer_reviews;
    `);
  }
}
