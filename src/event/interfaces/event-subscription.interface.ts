/**
 * Event Subscription
 */
export interface EventSubscription {
  unsubscribe(): Promise<void>;
}
