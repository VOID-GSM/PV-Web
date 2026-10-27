export interface Article {
  id: string;
  title: string;
  activity: string;
  round: string;
  tags: string[];
  date: string;
  author: string;
  commentsCount: number;
  content: string;
  feedbackOption: "common" | "all" | "custom" | "none";
  selectedMember?: string;
}
