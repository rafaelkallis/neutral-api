import { Column, JoinColumn, ManyToOne, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { RoleTypeOrmEntity } from './RoleTypeOrmEntity';
import { ReviewTopicTypeOrmEntity } from './ReviewTopicTypeOrmEntity';
import { MilestoneTypeOrmEntity } from './MilestoneTypeOrmEntity';

@Entity('peer_reviews')
@TypeOrmEntity.register(PeerReview)
export class PeerReviewTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.peerReviews)
  @JoinColumn({ name: 'project_id' })
  public project!: ProjectTypeOrmEntity;

  @Column({ name: 'project_id' })
  public projectId: string;

  @ManyToOne(() => RoleTypeOrmEntity)
  @JoinColumn({ name: 'sender_role_id' })
  public senderRole!: RoleTypeOrmEntity;

  @Column({ name: 'sender_role_id' })
  public senderRoleId: string;

  @ManyToOne(() => RoleTypeOrmEntity)
  @JoinColumn({ name: 'receiver_role_id' })
  public receiverRole!: RoleTypeOrmEntity;

  @Column({ name: 'receiver_role_id' })
  public receiverRoleId: string;

  @ManyToOne(() => ReviewTopicTypeOrmEntity)
  @JoinColumn({ name: 'review_topic_id' })
  public reviewTopic!: ReviewTopicTypeOrmEntity;

  @Column({ name: 'review_topic_id' })
  public reviewTopicId: string;

  @ManyToOne(() => MilestoneTypeOrmEntity)
  @JoinColumn({ name: 'milestone_id' })
  public milestone!: MilestoneTypeOrmEntity;

  @Column({ name: 'milestone_id' })
  public milestoneId: string;

  @Column({ name: 'score' })
  public score: number;

  @Column({ name: 'flag' })
  public flag: string;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    projectId: string,
    senderRoleId: string,
    receiverRoleId: string,
    reviewTopicId: string,
    milestoneId: string,
    score: number,
    flag: string,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.reviewTopicId = reviewTopicId;
    this.milestoneId = milestoneId;
    this.score = score;
    this.flag = flag;
  }
}
