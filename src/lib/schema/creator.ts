import { z } from "zod";

export const createProjectFormSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Description is required"),
  annotationTask: z.enum(["text-to-text", "text-classification"]),
  dueDate: z.coerce
    .date()
    .refine((date) => date > new Date(), "Due date must be in the future"),
  reward: z.coerce.number().min(1, "Credit must be at least 1"),
  maxContributors: z.coerce
    .number()
    .min(1, "Maximum contributors must be at least 1"),
  file: z
    .instanceof(File, { message: "Please upload a CSV file" })
    .refine((file) => file.type === "text/csv", "File must be a CSV")
    .refine((file) => file.size > 0, "File cannot be empty"),
});

export type FlattenedCreateProjectErrors = z.inferFlattenedErrors<
  typeof createProjectFormSchema
>;
