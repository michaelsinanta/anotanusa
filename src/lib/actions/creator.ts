"use server";

import {
  createProjectFormSchema,
  FlattenedCreateProjectErrors,
} from "@/lib/schema/creator";
import { type ActionState } from "@/lib/types/state";
import z from "zod";

export async function createProject(
  prevstate: ActionState<FlattenedCreateProjectErrors>,
  formData: FormData,
) {
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    annotationTask: formData.get("annotationTask"),
    dueDate: formData.get("dueDate"),
    reward: formData.get("reward"),
    maxContributors: formData.get("maxContributors"),
    file: formData.get("file"),
  };

  const result = createProjectFormSchema.safeParse(data);

  if (!result.success) {
    const errors = z.flattenError(result.error);

    return {
      message: "Failed to create project",
      isError: false,
      isValid: true,
      validationErrors: errors as FlattenedCreateProjectErrors,
    };
  }

  return {
    message: "Project created successfully!",
    isError: false,
    isValid: true,
  };
}
