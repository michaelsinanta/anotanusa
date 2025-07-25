"use server";

import {
  createProjectFormSchema,
  FlattenedCreateProjectErrors,
} from "@/lib/schema/creator";
import { type ActionState } from "@/lib/types/state";
import {
  addDoc,
  collection,
  getFirestore,
  setDoc,
  doc,
} from "firebase/firestore";
import z from "zod";
import { getAuthenticatedAppForUser } from "../firebase/server/serverApp";
import Papa from "papaparse";

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
    const file = data.file as File;

    const csvText = await file.text();
    const parsed = Papa.parse(csvText, { header: false });
    const processedData = parsed.data.slice(1).map((value) => {
      const columns = value as string[];
      const text = columns[0] || "";
      const choices = columns.slice(1).filter((choice) => choice !== "");
      return { text, choices };
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

    const db = getFirestore(firebaseServerApp);

    await addDoc(collection(db, "anotanusa-project"), {
      type: result.data.annotationTask,
      creatorId: currentUser.uid,
      dataset: processedData,
      answers: {},
      description: result.data.description,
      endDate: result.data.dueDate.toISOString(),
      title: result.data.title,
      totalCredits: result.data.reward,
      totalAnnotators: result.data.maxContributors,
      earlyEnd: false,
    });

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

export async function createOrUpdateUserDocument({
  uid,
  displayName,
  email,
  annotations = [],
  projects = [],
  wallet = {},
}: {
  uid: string;
  displayName: string;
  email: string;
  annotations?: string[];
  projects?: string[];
  wallet?: { rupiah?: string; number?: string; service?: string };
}) {
  try {
    const { firebaseServerApp } = await getAuthenticatedAppForUser();
    const db = getFirestore(firebaseServerApp);
    await setDoc(
      doc(db, "users", uid),
      {
        uid,
        displayName,
        email,
        lastLogin: new Date().toISOString(),
        annotations,
        projects,
        wallet: {
          rupiah: wallet.rupiah || "0",
          number: wallet.number || "",
          service: wallet.service || "",
        },
      },
      { merge: true },
    );
    return {
      success: true,
      message: "User document created/updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create/update user document.",
      error,
    };
  }
}
