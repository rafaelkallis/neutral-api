import { EntityManager, Connection, ConnectionManager } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { Type, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Id } from 'shared/domain/value-objects/Id';
import { Repository } from 'shared/domain/Repository';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Config } from 'shared/config/application/Config';

import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { NotificationTypeOrmEntity } from 'notification/infrastructure/NotificationTypeOrmEntity';

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
import { TypeOrmRepository } from './TypeOrmRepository';
import { AggregateRoot } from 'shared/domain/AggregateRoot';

@Injectable()
export class TypeOrmClient implements OnModuleInit {
  public readonly entityManager: EntityManager;
  private readonly logger: Logger;
  private readonly connection: Connection;
  private readonly objectMapper: ObjectMapper;

  public constructor(config: Config, objectMapper: ObjectMapper) {
    this.logger = new Logger(TypeOrmClient.name);
    const connectionManager = new ConnectionManager();
    const url = config.get('DATABASE_URL');
    const connection = connectionManager.create({
      name: 'default',
      type: 'postgres' as 'postgres',
      url,
      entities: [
        UserTypeOrmEntity,
        ProjectTypeOrmEntity,
        RoleTypeOrmEntity,
        PeerReviewTypeOrmEntity,
        NotificationTypeOrmEntity,
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
      ],
    });
    this.connection = connection;
    this.entityManager = connection.createEntityManager();
    this.objectMapper = objectMapper;
  }

  public createRepository<
    TId extends Id,
    TModel extends AggregateRoot<TId>,
    TEntity extends TypeOrmEntity
  >(
    modelType: Type<TModel>,
    entityType: Type<TEntity>,
  ): Repository<TId, TModel> {
    return TypeOrmRepository.create(
      modelType,
      entityType,
      this.entityManager,
      this.objectMapper,
    );
  }

  public async onModuleInit(): Promise<void> {
    await this.connection.connect();
    this.logger.log('Database connected');
    await this.connection.runMigrations();
    this.logger.log('Migrations up-to-date');
  }
}
