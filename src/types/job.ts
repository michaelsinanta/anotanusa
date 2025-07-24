export interface Job {
  id: number;
  name: string;
  type: "text-to-text" | "text-classification";
  description: string;
  creator: string;
  totalCredits: number;
  endDate: Date;
  totalParticipants: number;
  answers?: Map<string, string[]>;
}
