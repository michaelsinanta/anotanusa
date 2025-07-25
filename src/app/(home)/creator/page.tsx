import TaskCard from "@/components/projects/task-card";
import { Button } from "@/components/ui/button";
import { getAuthenticatedAppForUser } from "@/lib/firebase/server/serverApp";
import { TaskData } from "@/lib/types/project";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function CreatorDashboard() {
  const { firebaseServerApp, currentUser } = await getAuthenticatedAppForUser();

  const db = getFirestore(firebaseServerApp);

  const projects = await getDocs(
    query(
      collection(db, "anotanusa-project"),
      where("creatorId", "==", currentUser?.uid),
    ),
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/creator/new-project">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6">
        {projects.docs.map((project) => {
          const data = project.data();

          const taskData: TaskData = {
            creatorId: data.creatorId,
            dataset: data.dataset,
            answers: data.answers,
            description: data.description,
            endDate: data.endDate,
            title: data.title,
            totalCredits: data.totalCredits,
            totalAnnotators: data.totalAnnotators,
            currentAnnotators: Object.keys(data.answers).length,
            endEarly: data.earlyEnd,
            type: data.type,
          };

          return <TaskCard key={project.id} data={taskData} />;
        })}
      </div>
    </div>
  );
}
