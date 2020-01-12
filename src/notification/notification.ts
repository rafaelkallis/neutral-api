/**
 *
 */
export enum NotificationType {
  NEW_ASSIGNMENT = 'new_assignment',
  PEER_REVIEW_REQUESTED = 'peer_review_requested',
  MANAGER_REVIEW_REQUESTED = 'manager_review_requested',
  PROJECT_FINISHED = 'project_finished',
}

/**
 *
 */
export interface Notification {
  id: string;
  ownerId: string;
  type: NotificationType;
  isRead: boolean;
  payload: object;
}

/**
 *
 */
export interface NewAssignmentNotification extends Notification {
  type: NotificationType.NEW_ASSIGNMENT;
  payload: {
    role: {
      id: string;
      title: string;
    };
    project: {
      id: string;
      title: string;
    };
  };
}

/**
 *
 */
export interface PeerReviewRequestedNotification extends Notification {
  type: NotificationType.PEER_REVIEW_REQUESTED;
  payload: {
    role: {
      id: string;
      title: string;
    };
    project: {
      id: string;
      title: string;
    };
  };
}

/**
 *
 */
export interface ManagerReviewRequestedNotification extends Notification {
  type: NotificationType.MANAGER_REVIEW_REQUESTED;
  payload: {
    project: {
      id: string;
      title: string;
    };
  };
}

/**
 *
 */
export interface ProjectFinishedNotification extends Notification {
  type: NotificationType.PROJECT_FINISHED;
  payload: {
    project: {
      id: string;
      title: string;
    };
  };
}
