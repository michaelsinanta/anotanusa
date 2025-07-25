export interface Job {
  id: number;
  name: string;
  type: string;
  description: string;
  creator: string;
  totalCredits: number;
  endDate: string;
  totalAnnotators: number;
  answers?: Map<string, string[]>;
  dataset?: DataPoint[];
}

export interface DataPoint {
  choices: string[];
  text: string;
}
