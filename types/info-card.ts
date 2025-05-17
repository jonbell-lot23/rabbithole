export interface InfoCardType {
  id: string;
  topic: string;
  headline: string;
  detail?: string;
  parentCardId?: string;
  userFeedback?: "more" | "skip" | "custom";
  followUpQuestion?: string;
  isDeepResearch?: boolean;
}
