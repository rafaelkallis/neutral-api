import { EntityManager, Connection, ConnectionManager } from 'typeorm';
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Config } from 'shared/config/application/Config';

import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { ReviewTopicTypeOrmEntity } from 'project/infrastructure/ReviewTopicTypeOrmEntity';
import { ReviewTopicInputTypeOrmEntity } from 'project/infrastructure/ReviewTopicInputTypeOrmEntity';
import { MilestoneTypeOrmEntity } from 'project/infrastructure/MilestoneTypeOrmEntity';
import { RoleMetricTypeOrmEntity } from 'project/infrastructure/RoleMetricTypeOrmEntity';
import { MilestoneMetricTypeOrmEntity } from 'project/infrastructure/MilestoneMetricTypeOrmEntity';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';
import { OrganizationTypeOrmEntity } from 'organization/infrastructure/OrganizationTypeOrmEntity';
import { OrganizationMembershipTypeOrmEntity } from 'organization/infrastructure/OrganizationMembershipTypeOrmEntity';

import { UserMigration1564324478234 } from 'shared/typeorm/migration/1564324478234-UserMigration';
import { ProjectMigration1564574530189 } from 'shared/typeorm/migration/1564574530189-ProjectMigration';
import { RoleMigration1565196023819 } from 'shared/typeorm/migration/1565196023819-RoleMigration';
import { RoleAddPeerReviewsMigration1565959658265 } from 'shared/typeorm/migration/1565959658265-RoleAddPeerReviewsMigration';
import { ProjectAddStateMigration1566065005084 } from 'shared/typeorm/migration/1566065005084-ProjectAddStateMigration';
import { ProjectAddRelativeContributionsMigration1566388217574 } from 'shared/typeorm/migration/1566388217574-ProjectAddRelativeContributionsMigration';
import { ProjectRenameRelativeContributionsToContributionsMigration1570810937000 } from 'shared/typeorm/migration/1570810937000-ProjectRenameRelativeContributionsToContributions';
import { UserAddFullNameTextSearchMigration1571300853000 } from 'shared/typeorm/migration/1571300853000-UserAddFullNameTextSearchMigration';
import { TeamSpiritProjectMigration1572708493000 } from 'shared/typeorm/migration/1572708493000-TeamSpiritMigration';
import { ProjectRenameTeamSpiritToConsensualityMigration1573457347000 } from 'shared/typeorm/migration/1573457347000-rename-team-spirit-to-consensuality';
import { AddPeerReviewsMigration1573718439000 } from 'shared/typeorm/migration/1573718439000-add-peer-reviews-table.migration';
import { MoveContributionToRoleMigration1574614783000 } from 'shared/typeorm/migration/1574614783000-move-contribution-to-role.migrations';
import { AddContributionVisibilityMigration1575638415000 } from 'shared/typeorm/migration/1575638415000-add-contribution-visibility.migration';
import { AddSkipManagerReviewMigration1575736684000 } from 'shared/typeorm/migration/1575736684000-add-skip-manager-review.migration';
import { PeerReviewRename1576248460000 } from 'shared/typeorm/migration/1576248460000-peer-review-rename.migration';
import { AddPeerReviewVisibilityMigration1576252691000 } from 'shared/typeorm/migration/1576252691000-add-peer-review-visibility.migration';
import { AddHasSubmittedPeerReviewsMigration1576331058000 } from 'shared/typeorm/migration/1576331058000-add-role-has-submitted-peer-reviews.migration';
import { RemovePeerReviewVisibilityMigration1576415094000 } from 'shared/typeorm/migration/1576415094000-remove-peer-review-visibility.migration';
import { AddNotificationsMigration1578833839000 } from 'shared/typeorm/migration/1578833839000-add-notifications.migration';
import { RenameProjectOwnerToCreatorMigration1579969356000 } from 'shared/typeorm/migration/1579969356000-rename-project-owner-to-creator-migration';
import { AddProjectIdToPeerReviewMigration1581946721000 } from 'shared/typeorm/migration/1581946721000AddProjectIdToPeerReviewMigration';
import { AddAvatarToUsersMigration1584023287000 } from 'shared/typeorm/migration/1584023287000AddAvatarToUsers';
import { AddStateToUsersMigration1587059776000 } from 'shared/typeorm/migration/1587059776000AddStateToUsers';
import { DropUniqueUserEmailConstraintMigration1587070723000 } from 'shared/typeorm/migration/1587070723000DropUniqueUserEmailConstraint';
import { AddReviewTopicsMigration1588178451000 } from 'shared/typeorm/migration/1588178451000AddReviewTopicsMigration';
import { AddContributionsMigration1588327814000 } from 'shared/typeorm/migration/1588327814000AddContributionMigration';
import { AddReviewTopicToPeerReviewMigration1588452568000 } from 'shared/typeorm/migration/1588452568000AddReviewTopicToPeerReviewMigration';
import { RemoveRoleContributionMigration1588526416000 } from 'shared/typeorm/migration/1588526416000RemoveRoleContributionMigration';
import { RemoveHasSubmittedPeerReviewsMigration1589309292000 } from 'shared/typeorm/migration/1589309292000RemoveHasSubmittedPeerReviews';
import { MoveConsensualityFromProjectToReviewTopicsMigration1589827278000 } from 'shared/typeorm/migration/1589827278000MoveConsensualityFromProjectToReviewTopics';
import { RenameInitialAndInvitedUserStateToPendingMigration1590750557000 } from 'shared/typeorm/migration/1590750557000RenameInitialAndInvitedUserStateToPendingMigration';
import { AddReviewTopicInputMigration1592508374000 } from 'shared/typeorm/migration/1592508374000AddReviewTopicInputMigration';
import { AddProjectMetaMigration1594370335000 } from 'shared/typeorm/migration/1594370335000AddProjectMetaMigration';
import { AddPeerReviewFlagMigration1595059121000 } from 'shared/typeorm/migration/1595059121000AddPeerReviewFlagMigration';
import { AddPeerReviewVisibilityMigration1595594629000 } from 'shared/typeorm/migration/1595594629000AddPeerReviewVisibility';
import { AddOrganizationsMigration1595764704000 } from 'shared/typeorm/migration/1595764704000AddOrganizationsMigration';
import { AddOrganizationMembershipsMigration1595777246000 } from 'shared/typeorm/migration/1595777246000AddOrganizationMembershipMigration';
import { AddAddRolesAndPeerReviewsProjectIdIndexesMigration1599128899000 } from 'shared/typeorm/migration/1599128899000AddRolesAndPeerReviewsProjectIdIndexesMigration';
import { AddAssigneeIdIndexMigration1599745163000 } from 'shared/typeorm/migration/1599745163000AddAssigneeIdIndexMigration';
import { AddMilestonesMigration1605904211000 } from 'shared/typeorm/migration/1605904211000AddMilestonesMigration';
import { AddMilestoneStateMigration1605953746000 } from 'shared/typeorm/migration/1605953746000AddMilestoneStateMigration';
import { AddPeerReviewMilestoneMigration1606052766000 } from 'shared/typeorm/migration/1606052766000AddPeerReviewMilestoneMigration';
import { AddContributionMilestoneMigration1606589847000 } from 'shared/typeorm/migration/1606589847000AddContributionMilestoneMigration';
import { AddRoleMetricMigration1610889568000 } from './migration/1610889568000AddRoleMetricMigration';
import { RemoveContributionsMigration1611319813000 } from './migration/1611319813000RemoveContributionsMigration';
import { AddMilestoneMetricMigration1611397932000 } from './migration/1611397932000AddMilestoneMetricMigration';

@Injectable()
export class TypeOrmClient implements OnModuleInit, OnApplicationShutdown {
  public readonly entityManager: EntityManager;
  private readonly logger: Logger;
  private readonly connection: Connection;

  public constructor(config: Config) {
    this.logger = new Logger(TypeOrmClient.name);
    const connectionManager = new ConnectionManager();
    const url = config.get('DATABASE_URL');
    const connection = connectionManager.create({
      name: 'default',
      type: 'postgres' as const,
      url,
      entities: [
        UserTypeOrmEntity,
        ProjectTypeOrmEntity,
        RoleTypeOrmEntity,
        PeerReviewTypeOrmEntity,
        ReviewTopicTypeOrmEntity,
        ReviewTopicInputTypeOrmEntity,
        MilestoneTypeOrmEntity,
        RoleMetricTypeOrmEntity,
        MilestoneMetricTypeOrmEntity,
        NotificationTypeOrmEntity,
        OrganizationTypeOrmEntity,
        OrganizationMembershipTypeOrmEntity,
      ],
      migrations: [
        UserMigration1564324478234,
        ProjectMigration1564574530189,
        RoleMigration1565196023819,
        RoleAddPeerReviewsMigration1565959658265,
        ProjectAddStateMigration1566065005084,
        ProjectAddRelativeContributionsMigration1566388217574,
        ProjectRenameRelativeContributionsToContributionsMigration1570810937000,
        UserAddFullNameTextSearchMigration1571300853000,
        TeamSpiritProjectMigration1572708493000,
        ProjectRenameTeamSpiritToConsensualityMigration1573457347000,
        AddPeerReviewsMigration1573718439000,
        MoveContributionToRoleMigration1574614783000,
        AddContributionVisibilityMigration1575638415000,
        AddSkipManagerReviewMigration1575736684000,
        PeerReviewRename1576248460000,
        AddPeerReviewVisibilityMigration1576252691000,
        AddHasSubmittedPeerReviewsMigration1576331058000,
        RemovePeerReviewVisibilityMigration1576415094000,
        AddNotificationsMigration1578833839000,
        RenameProjectOwnerToCreatorMigration1579969356000,
        AddProjectIdToPeerReviewMigration1581946721000,
        AddAvatarToUsersMigration1584023287000,
        AddStateToUsersMigration1587059776000,
        DropUniqueUserEmailConstraintMigration1587070723000,
        AddReviewTopicsMigration1588178451000,
        AddContributionsMigration1588327814000,
        AddReviewTopicToPeerReviewMigration1588452568000,
        RemoveRoleContributionMigration1588526416000,
        RemoveHasSubmittedPeerReviewsMigration1589309292000,
        MoveConsensualityFromProjectToReviewTopicsMigration1589827278000,
        RenameInitialAndInvitedUserStateToPendingMigration1590750557000,
        AddReviewTopicInputMigration1592508374000,
        AddProjectMetaMigration1594370335000,
        AddPeerReviewFlagMigration1595059121000,
        AddPeerReviewVisibilityMigration1595594629000,
        AddOrganizationsMigration1595764704000,
        AddOrganizationMembershipsMigration1595777246000,
        AddAddRolesAndPeerReviewsProjectIdIndexesMigration1599128899000,
        AddAssigneeIdIndexMigration1599745163000,
        AddMilestonesMigration1605904211000,
        AddMilestoneStateMigration1605953746000,
        AddPeerReviewMilestoneMigration1606052766000,
        AddContributionMilestoneMigration1606589847000,
        AddRoleMetricMigration1610889568000,
        RemoveContributionsMigration1611319813000,
        AddMilestoneMetricMigration1611397932000,
      ],
    });
    this.connection = connection;
    this.entityManager = connection.createEntityManager();
  }

  public async onModuleInit(): Promise<void> {
    await this.connection.connect();
    this.logger.log('Database connected');
    await this.connection.runMigrations({ transaction: 'all' });
    this.logger.log('Migrations up-to-date');
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.connection.close();
    this.logger.log('Database disconnected');
  }
}
