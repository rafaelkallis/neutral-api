import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Normalize contributions, move projects.contributions -> roles.contribution.
 */
export class MoveContributionToRoleMigration1574614783000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles ADD COLUMN contribution real;
      
      UPDATE roles
        SET contribution = c.contribution
        FROM (
          SELECT 
            key as role_id,
            value::real as contribution
          FROM projects, jsonb_each_text(contributions)
        ) as c
        WHERE roles.id = c.role_id;

      ALTER TABLE projects DROP COLUMN contributions;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN contributions jsonb;

      UPDATE projects
        SET contributions = c.json_contributions
        FROM (
          SELECT 
            project_id,
            jsonb_object_agg(
              id, 
              contribution
            ) as json_contributions
          FROM roles
          GROUP BY project_id
        ) as c
        WHERE projects.id = c.project_id;
        
      ALTER TABLE roles DROP COLUMN contribution;
    `);
  }
}
