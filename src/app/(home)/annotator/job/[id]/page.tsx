"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client/clientApp";
import TextClassificationForm from "@/components/annotator/tasks/text-classification-form";
import { AlertTriangle } from "lucide-react";

const TASK_COMPONENTS = {
  "text-classification": TextClassificationForm,
  // Add other task types here as you implement them
} as const;

function UnsupportedTaskType() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-yellow-300 bg-yellow-50 p-8 text-center shadow-sm">
      <AlertTriangle className="mb-2 h-8 w-8 text-yellow-500" />
      <h2 className="mb-1 text-lg font-semibold text-yellow-800">
        Unsupported Task Type
      </h2>
    </div>
  );
}

export default function AnnotationPage() {
  const params = useParams();
  const id = params?.id as string;
  const [type, setType] = useState<string>("");
  useEffect(() => {
    const fetchJob = async () => {
      const projectsCol = collection(db, "anotanusa-project");
      const projectsSnapshot = await getDocs(projectsCol);
      const project = projectsSnapshot.docs.find((doc) => doc.id === id);
      if (project) {
        setType(project.data().type);
      }
    };
    fetchJob();
  }, [id]);
  const TaskComponent = TASK_COMPONENTS[type as keyof typeof TASK_COMPONENTS];

  return TaskComponent ? <TaskComponent /> : <UnsupportedTaskType />;
}
