export interface Role {
  id: string;
  projectId: string;
  assigneeId: string | null;
  title: string;
  description: string;
  contribution: number | null;
  hasSubmittedPeerReviews: boolean;
}

export interface PeerReview {
  id: string;
  senderRoleId: string;
  receiverRoleId: string;
  score: number;
}
