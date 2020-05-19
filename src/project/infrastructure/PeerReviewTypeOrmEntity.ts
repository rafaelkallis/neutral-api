import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';

/**
 * Peer Review TypeOrm Entity
 */
@Entity('peer_reviews')
export class PeerReviewTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.peerReviews)
  @JoinColumn({ name: 'project_id' })
  public project: ProjectTypeOrmEntity;

  @Column({ name: 'sender_role_id' })
  public senderRoleId: string;

  @Column({ name: 'receiver_role_id' })
  public receiverRoleId: string;

  @Column({ name: 'review_topic_id' })
  public reviewTopicId: string;

  @Column({ name: 'score' })
  public score: number;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    project: ProjectTypeOrmEntity,
    senderRoleId: string,
    receiverRoleId: string,
    reviewTopicId: string,
    score: number,
  ) {
    super(id, createdAt, updatedAt);
    this.project = project;
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.reviewTopicId = reviewTopicId;
    this.score = score;
  }
}
