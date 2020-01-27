import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Database } from 'database/database';
import { ConfigService, InjectConfig } from 'config';
import { Connection, ConnectionManager, EntityManager } from 'typeorm';

import { UserEntity } from 'user/entities/user.entity';
import { ProjectEntity } from 'project/entities/project.entity';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { RoleEntity } from 'role/entities/role.entity';
import { NotificationEntity } from 'notification/entities/notification.entity';

import { UserMigration1564324478234 } from 'database/migration/1564324478234-UserMigration';
import { ProjectMigration1564574530189 } from 'database/migration/1564574530189-ProjectMigration';
import { RoleMigration1565196023819 } from 'database/migration/1565196023819-RoleMigration';
import { RoleAddPeerReviewsMigration1565959658265 } from 'database/migration/1565959658265-RoleAddPeerReviewsMigration';
import { ProjectAddStateMigration1566065005084 } from 'database/migration/1566065005084-ProjectAddStateMigration';
import { ProjectAddRelativeContributionsMigration1566388217574 } from 'database/migration/1566388217574-ProjectAddRelativeContributionsMigration';
import { ProjectRenameRelativeContributionsToContributionsMigration1570810937000 } from 'database/migration/1570810937000-ProjectRenameRelativeContributionsToContributions';
import { UserAddFullNameTextSearchMigration1571300853000 } from 'database/migration/1571300853000-UserAddFullNameTextSearchMigration';
import { TeamSpiritProjectMigration1572708493000 } from 'database/migration/1572708493000-TeamSpiritMigration';
import { ProjectRenameTeamSpiritToConsensualityMigration1573457347000 } from 'database/migration/1573457347000-rename-team-spirit-to-consensuality';
import { AddPeerReviewsMigration1573718439000 } from 'database/migration/1573718439000-add-peer-reviews-table.migration';
import { MoveContributionToRoleMigration1574614783000 } from 'database/migration/1574614783000-move-contribution-to-role.migrations';
import { AddContributionVisibilityMigration1575638415000 } from 'database/migration/1575638415000-add-contribution-visibility.migration';
import { AddSkipManagerReviewMigration1575736684000 } from 'database/migration/1575736684000-add-skip-manager-review.migration';
import { PeerReviewRename1576248460000 } from 'database/migration/1576248460000-peer-review-rename.migration';
import { AddPeerReviewVisibilityMigration1576252691000 } from 'database/migration/1576252691000-add-peer-review-visibility.migration';
import { AddHasSubmittedPeerReviewsMigration1576331058000 } from 'database/migration/1576331058000-add-role-has-submitted-peer-reviews.migration';
import { RemovePeerReviewVisibilityMigration1576415094000 } from 'database/migration/1576415094000-remove-peer-review-visibility.migration';
import { AddNotificationsMigration1578833839000 } from 'database/migration/1578833839000-add-notifications.migration';
import { Logger, InjectLogger } from 'logger';
import { RenameProjectOwnerToCreatorMigration1579969356000 } from 'database/migration/1579969356000-rename-project-owner-to-creator-migration';

@Injectable()
export class DatabaseImpl implements Database, OnModuleInit, OnModuleDestroy {
  private static readonly DEFAULT_CONNECTION = 'DEFAULT_CONNECTION';
  private readonly config: ConfigService;
  private readonly logger: Logger;
  private readonly connectionManager: ConnectionManager;

  public constructor(
    @InjectConfig() config: ConfigService,
    @InjectLogger() logger: Logger,
  ) {
    this.config = config;
    this.logger = logger;
    this.connectionManager = new ConnectionManager();
    this.createConnection();
  }

  /**
   *
   */
  public getEntityManager(): EntityManager {
    return this.getConnection().manager;
  }

  /**
   *
   */
  public async onModuleInit(): Promise<void> {
    await this.getConnection().connect();
    this.logger.log('Database connected');
    await this.getConnection().runMigrations();
    this.logger.log('Database migrations up to date');
  }

  /**
   *
   */
  public async onModuleDestroy(): Promise<void> {
    await this.getConnection().close();
    this.logger.log('Database disconnected');
  }

  /**
   *
   */
  private getConnection(): Connection {
    return this.connectionManager.get(DatabaseImpl.DEFAULT_CONNECTION);
  }

  /**
   *
   */
  private createConnection(): void {
    this.connectionManager.create({
      name: DatabaseImpl.DEFAULT_CONNECTION,
      type: 'postgres' as 'postgres',
      url: this.config.get('DATABASE_URL'),
      entities: [
        UserEntity,
        ProjectEntity,
        RoleEntity,
        PeerReviewEntity,
        NotificationEntity,
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
      ],
    });
  }
}
