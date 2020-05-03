import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Normalize contributions, move projects.contributions -> roles.contribution.
 */
export class RemoveRoleContributionMigration1588526416000
  implements MigrationInterface {
  /**
   * Up
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO contributions (
          SELECT 
            object_id(),
            q.project_id,
            q.role_id,
            q.review_topic_id,
            q.amount,
            q.created_at,
            q.updated_at 
          FROM (
              SELECT
                roles.id as role_id,
                projects.id as project_id,
                review_topics.id as review_topic_id,
                roles.contribution as amount,
                roles.created_at as created_at,
                roles.updated_at as updated_at
              FROM
                projects, roles, review_topics
              WHERE 
                roles.contribution IS NOT null
                AND roles.project_id = projects.id
                AND review_topics.project_id = projects.id
          ) as q
        );
      
      ALTER TABLE roles DROP COLUMN contribution;
    `);
  }

  /**
   * Down
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE roles CREATE COLUMN contribution real;

      UPDATE roles
        SET contribution = q.amount
        FROM (
          SELECT
            contributions.role_id as role_id,
            contributions.amount as amount
          FROM 
            contributions
        ) as q
        WHERE q.role_id = roles.id;
    `);
  }
}
