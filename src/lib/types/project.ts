export type TaskData = {
  creatorId: string;
  dataset: {
    text: string;
    choices: string[];
  }[];
  answers: object;
  description: string;
  endDate: string;
  title: string;
  totalCredits: number;
  totalAnnotators: number;
  currentAnnotators: number;
  endEarly: boolean;
  type: "text-to-text" | "text-classification";
};
