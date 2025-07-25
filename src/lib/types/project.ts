export type TaskData = {
  creatorId: string;
  dataset: {
    text: string;
    choices: string[];
  }[];
  answers: Record<string, string[]>;
  description: string;
  endDate: string;
  title: string;
  totalCredits: number;
  totalAnnotators: number;
  currentAnnotators: number;
  endEarly: boolean;
  type: "text-to-text" | "text-classification" | "text-ranking";
};
