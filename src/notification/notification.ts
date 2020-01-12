export interface Notification {
  id: string;
  ownerId: string;
  type: string;
  isRead: boolean;
  payload: object;
}
