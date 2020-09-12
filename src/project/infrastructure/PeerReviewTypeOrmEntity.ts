import { Column, JoinColumn, ManyToOne, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { PeerReview } from 'project/domain/peer-review/PeerReview';

@Entity('peer_reviews')
@TypeOrmEntity.register(PeerReview)
export class PeerReviewTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.peerReviews)
  @JoinColumn({ name: 'project_id' })
  public project: ProjectTypeOrmEntity;

  @Column({ name: 'project_id' })
  public projectId: string;

  @Column({ name: 'sender_role_id' })
  public senderRoleId: string;

  @Column({ name: 'receiver_role_id' })
  public receiverRoleId: string;

  @Column({ name: 'review_topic_id' })
  public reviewTopicId: string;

  @Column({ name: 'score' })
  public score: number;

  @Column({ name: 'flag' })
  public flag: string;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    project: ProjectTypeOrmEntity,
    projectId: string,
    senderRoleId: string,
    receiverRoleId: string,
    reviewTopicId: string,
    score: number,
    flag: string,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.projectId = projectId;
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.reviewTopicId = reviewTopicId;
    this.score = score;
    this.flag = flag;
  }
}
