import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add peer review flag.
 */
export class AddPeerReviewFlagMigration1595059121000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE peer_reviews ADD COLUMN flag varchar(64);

      UPDATE peer_reviews SET flag = 'none';
      
      ALTER TABLE peer_reviews ALTER COLUMN flag SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE peer_reviews DROP COLUMN flag;
    `);
  }
}
