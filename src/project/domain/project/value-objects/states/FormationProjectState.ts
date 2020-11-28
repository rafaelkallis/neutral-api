import {
  InternalProject,
  UpdateProjectContext,
} from 'project/domain/project/Project';
import { ProjectUpdatedEvent } from 'project/domain/events/ProjectUpdatedEvent';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ReadonlyRole, Role } from 'project/domain/role/Role';
import { RoleCreatedEvent } from 'project/domain/events/RoleCreatedEvent';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { RoleUpdatedEvent } from 'project/domain/events/RoleUpdatedEvent';
import { RoleDeletedEvent } from 'project/domain/events/RoleDeletedEvent';
import { ReadonlyUser } from 'user/domain/User';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { UserUnassignedEvent } from 'project/domain/events/UserUnassignedEvent';
import { ProjectFormationFinishedEvent } from 'project/domain/events/ProjectFormationFinishedEvent';
import { CancellableProjectState } from 'project/domain/project/value-objects/states/CancellableProjectState';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import {
  ReadonlyReviewTopic,
  ReviewTopic,
} from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicCreatedEvent } from 'project/domain/events/ReviewTopicCreatedEvent';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReviewTopicUpdatedEvent } from 'project/domain/events/ReviewTopicUpdatedEvent';
import { ReviewTopicRemovedEvent } from 'project/domain/events/ReviewTopicRemovedEvent';
import { ReviewTopicInput } from 'project/domain/review-topic/ReviewTopicInput';
import { ActiveProjectState } from './ActiveProjectState';
import { ProjectState } from './ProjectState';

export class FormationProjectState extends CancellableProjectState {
  public static readonly INSTANCE: ProjectState = new FormationProjectState();

  protected getOrdinal(): number {
    return 0;
  }

  public update(project: InternalProject, context: UpdateProjectContext): void {
    if (context.title) {
      project.title = context.title;
    }
    if (context.description) {
      project.description = context.description;
    }
    if (context.peerReviewVisibility) {
      project.peerReviewVisibility = context.peerReviewVisibility;
    }
    if (context.contributionVisibility) {
      project.contributionVisibility = context.contributionVisibility;
    }
    if (context.skipManagerReview) {
      project.skipManagerReview = context.skipManagerReview;
    }
    if (context.meta) {
      project.meta = context.meta;
    }
    project.raise(new ProjectUpdatedEvent(project));
  }

  public addRole(
    project: InternalProject,
    title: RoleTitle,
    description: RoleDescription,
  ): ReadonlyRole {
    const role = Role.from(title, description);
    project.roles.add(role);
    project.raise(new RoleCreatedEvent(project.id, role.id));
    return role;
  }

  public updateRole(
    project: InternalProject,
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void {
    const roleToUpdate = project.roles.whereId(roleId);
    if (title) {
      roleToUpdate.title = title;
    }
    if (description) {
      roleToUpdate.description = description;
    }
    if (title || description) {
      project.raise(new RoleUpdatedEvent(roleToUpdate));
    }
  }

  public removeRole(project: InternalProject, roleId: RoleId): void {
    const roleToRemove = project.roles.whereId(roleId);
    project.roles.remove(roleToRemove);
    project.raise(new RoleDeletedEvent(roleToRemove));
  }

  public assignUserToRole(
    project: InternalProject,
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void {
    const roleToBeAssigned = project.roles.whereId(roleId);
    if (roleToBeAssigned.isAssignedToUser(userToAssign)) {
      return;
    }
    if (roleToBeAssigned.isAssigned()) {
      project.unassignRole(roleToBeAssigned.id);
    }
    if (project.roles.isAnyAssignedToUser(userToAssign)) {
      const currentAssignedRole = project.roles.whereAssignee(userToAssign);
      project.unassignRole(currentAssignedRole.id);
    }
    roleToBeAssigned.assigneeId = userToAssign.id;
    project.roles.assertUniqueAssignees();
    project.raise(
      new UserAssignedEvent(project, roleToBeAssigned, userToAssign),
    );
  }

  public unassign(project: InternalProject, roleId: RoleId): void {
    const role = project.roles.whereId(roleId);
    const previousAssigneeId = role.assertAssigned();
    role.assigneeId = null;
    project.raise(new UserUnassignedEvent(project, role, previousAssigneeId));
  }

  public addReviewTopic(
    project: InternalProject,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
    input: ReviewTopicInput,
  ): ReadonlyReviewTopic {
    const reviewTopic = ReviewTopic.of(title, description, input);
    project.reviewTopics.add(reviewTopic);
    project.raise(new ReviewTopicCreatedEvent(project.id, reviewTopic.id));
    return reviewTopic;
  }

  public updateReviewTopic(
    project: InternalProject,
    reviewTopicId: ReviewTopicId,
    title?: ReviewTopicTitle,
    description?: ReviewTopicDescription,
    input?: ReviewTopicInput,
  ): void {
    const reviewTopicToUpdate = project.reviewTopics.whereId(reviewTopicId);
    if (title) {
      reviewTopicToUpdate.title = title;
    }
    if (description) {
      reviewTopicToUpdate.description = description;
    }
    if (input) {
      reviewTopicToUpdate.input = input;
    }
    project.raise(new ReviewTopicUpdatedEvent(reviewTopicToUpdate.id));
  }

  public removeReviewTopic(
    project: InternalProject,
    reviewTopicId: ReviewTopicId,
  ): void {
    const reviewTopicToRemove = project.reviewTopics.whereId(reviewTopicId);
    project.reviewTopics.remove(reviewTopicToRemove);
    project.raise(new ReviewTopicRemovedEvent(reviewTopicId));
  }

  public finishFormation(project: InternalProject): void {
    project.roles.assertSufficientAmount();
    project.roles.assertAllAreAssigned();
    project.reviewTopics.assertSufficientAmount();
    // TODO make configurable
    // assignees.assertAllAreActive();
    project.state = ActiveProjectState.INSTANCE;
    project.raise(new ProjectFormationFinishedEvent(project));
  }

  private constructor() {
    super();
  }
}
