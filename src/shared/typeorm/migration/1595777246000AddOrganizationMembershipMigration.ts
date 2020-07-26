import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add organization memberships table.
 */
export class AddOrganizationMembershipsMigration1595777246000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE organization_memberships (
        id varchar(64) PRIMARY KEY,
        organization_id varchar(64) NOT NULL REFERENCES organizations(id),
        member_id varchar(64) NOT NULL REFERENCES users(id),
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        UNIQUE(organization_id, member_id)
      );

      CREATE INDEX organization_memberships_organization_id_index
        ON organization_memberships (organization_id);

      CREATE INDEX organization_memberships_member_id_index
        ON organization_memberships (member_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX organization_memberships_organization_id_index;
        DROP INDEX organization_memberships_member_id_index;

        DROP TABLE organization_memberships;
    `);
  }
}
