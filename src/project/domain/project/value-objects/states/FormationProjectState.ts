import {
  ProjectState,
  DefaultProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';
import { Project } from 'project/domain/project/Project';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { ProjectUpdatedEvent } from 'project/domain/events/ProjectUpdatedEvent';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { Role } from 'project/domain/role/Role';
import { RoleCreatedEvent } from 'project/domain/events/RoleCreatedEvent';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { RoleUpdatedEvent } from 'project/domain/events/RoleUpdatedEvent';
import { RoleDeletedEvent } from 'project/domain/events/RoleDeletedEvent';
import { ReadonlyUser } from 'user/domain/User';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { UserUnassignedEvent } from 'project/domain/events/UserUnassignedEvent';
import { ProjectFormationFinishedEvent } from 'project/domain/events/ProjectFormationFinishedEvent';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectPeerReview } from 'project/domain/project/value-objects/states/ProjectPeerReview';
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

export class FormationProjectState extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new CancellableProjectState(
    new FormationProjectState(),
  );

  private constructor() {
    super();
  }
  public update(
    project: Project,
    title?: ProjectTitle,
    description?: ProjectDescription,
  ): void {
    if (title) {
      project.title = title;
    }
    if (description) {
      project.description = description;
    }
    project.raise(new ProjectUpdatedEvent(project));
  }

  public addRole(
    project: Project,
    title: RoleTitle,
    description: RoleDescription,
  ): Role {
    const role = Role.from(title, description);
    project.roles.add(role);
    project.raise(new RoleCreatedEvent(project.id, role.id));
    return role;
  }

  public updateRole(
    project: Project,
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void {
    const roleToUpdate = project.roles.findById(roleId);
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

  public removeRole(project: Project, roleId: RoleId): void {
    const roleToRemove = project.roles.findById(roleId);
    project.roles.remove(roleToRemove);
    project.raise(new RoleDeletedEvent(roleToRemove));
  }

  public assignUserToRole(
    project: Project,
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void {
    const roleToBeAssigned = project.roles.findById(roleId);
    if (roleToBeAssigned.isAssignedToUser(userToAssign)) {
      return;
    }
    if (roleToBeAssigned.isAssigned()) {
      project.unassignRole(roleToBeAssigned.id);
    }
    if (project.roles.isAnyAssignedToUser(userToAssign)) {
      const currentAssignedRole = project.roles.findByAssignee(userToAssign);
      project.unassignRole(currentAssignedRole.id);
    }
    roleToBeAssigned.assigneeId = userToAssign.id;
    project.roles.assertSingleAssignmentPerUser();
    project.raise(
      new UserAssignedEvent(project, roleToBeAssigned, userToAssign),
    );
  }

  public unassign(project: Project, roleId: RoleId): void {
    const role = project.roles.findById(roleId);
    const previousAssigneeId = role.assertAssigned();
    role.assigneeId = null;
    project.raise(new UserUnassignedEvent(project, role, previousAssigneeId));
  }

  public addReviewTopic(
    project: Project,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
  ): ReadonlyReviewTopic {
    const reviewTopic = ReviewTopic.from(title, description);
    project.reviewTopics.add(reviewTopic);
    project.raise(new ReviewTopicCreatedEvent(project.id, reviewTopic.id));
    return reviewTopic;
  }

  public updateReviewTopic(
    project: Project,
    reviewTopicId: ReviewTopicId,
    title?: ReviewTopicTitle,
    description?: ReviewTopicDescription,
  ): void {
    const reviewTopicToUpdate = project.reviewTopics.findById(reviewTopicId);
    if (title) {
      reviewTopicToUpdate.title = title;
    }
    if (description) {
      reviewTopicToUpdate.description = description;
    }
    project.raise(new ReviewTopicUpdatedEvent(reviewTopicToUpdate.id));
  }

  public removeReviewTopic(
    project: Project,
    reviewTopicId: ReviewTopicId,
  ): void {
    const reviewTopicToRemove = project.reviewTopics.findById(reviewTopicId);
    project.reviewTopics.remove(reviewTopicToRemove);
    project.raise(new ReviewTopicRemovedEvent(reviewTopicId));
  }

  public finishFormation(project: Project): void {
    project.roles.assertSufficientAmount();
    project.roles.assertAllAreAssigned();

    // for backwards compatibility
    this.addReviewTopic(
      project,
      ReviewTopicTitle.from('Contribution'),
      ReviewTopicDescription.from(''),
    );

    project.reviewTopics.assertSufficientAmount();
    project.state = ProjectPeerReview.INSTANCE;
    project.raise(new ProjectFormationFinishedEvent(project));
    project.raise(new ProjectPeerReviewStartedEvent(project));
  }
}
