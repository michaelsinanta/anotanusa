"use server";

import {
  createProjectFormSchema,
  FlattenedCreateProjectErrors,
} from "@/lib/schema/creator";
import { type ActionState } from "@/lib/types/state";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import z from "zod";
import { getAuthenticatedAppForUser } from "../firebase/server/serverApp";

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

  try {
    // Processing CSV Columns
    const file = data.file as File;

    // Read and parse CSV file
    const csvText = await file.text();
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");

    // Process CSV rows
    const processedData = lines.map((line) => {
      const columns = line.split(",").map((col) => col.trim());
      const text = columns[0] || "";
      const choices = columns.slice(1).filter((choice) => choice !== "");

      return {
        text: text,
        choices: choices,
      };
    });

    const { firebaseServerApp, currentUser } =
      await getAuthenticatedAppForUser();

    if (!currentUser) {
      return {
        message: "User not authenticated",
        isError: true,
        isValid: false,
      };
    }

    await addDoc(
      collection(getFirestore(firebaseServerApp), "anotanusa-project"),
      {
        creatorId: currentUser.uid,
        dataset: processedData,
        answer: {},
        description: result.data.description,
        endDate: result.data.dueDate,
        title: result.data.title,
        totalCredits: result.data.reward,
        totalAnnotators: result.data.maxContributors,
      },
    );

    return {
      message: "Project created successfully!",
      isError: false,
      isValid: true,
    };
  } catch (error) {
    console.error("Error creating project:", error);
    return {
      message: "Failed to create project. Please try again later.",
      isError: true,
      isValid: false,
    };
  }
}
