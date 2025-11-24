export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  startDate: number;
  endDate?: number;
  active: boolean;
}

export const SubscriptionsModel: Record<string, Subscription> = {};
