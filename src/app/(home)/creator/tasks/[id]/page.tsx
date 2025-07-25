import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthenticatedAppForUser } from "@/lib/firebase/server/serverApp";
import type { TaskData } from "@/lib/types/project";
import { cn } from "@/lib/utils";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Calendar, Coins, FileText, Users } from "lucide-react";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { firebaseServerApp, currentUser } = await getAuthenticatedAppForUser();
  const { id } = await params;

  if (!currentUser) {
    return <div className="p-8">Please log in to view this task.</div>;
  }

  const db = getFirestore(firebaseServerApp);

  const taskDocSnap = await getDoc(doc(db, "anotanusa-project", id));

  if (!taskDocSnap.exists()) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Task not found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                The task you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const taskData = taskDocSnap.data() as TaskData;
  const endDate = new Date(taskData.endDate);
  const isExpired = endDate < new Date();
  const currentAnnotators = Object.keys(taskData.answers).length;
  const progress =
    taskData.totalAnnotators > 0
      ? (currentAnnotators / taskData.totalAnnotators) * 100
      : 0;
  const projectIsValid =
    !taskData.endEarly ||
    new Date(taskData.endDate) > new Date() ||
    taskData.currentAnnotators < taskData.totalAnnotators;

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {taskData.title}
            </h1>
            <p className="mt-2 text-lg text-gray-600">{taskData.description}</p>
          </div>

          <div className="flex flex-col gap-1">
            <Badge
              className={cn({
                "bg-green-100 text-green-800": projectIsValid,
                "bg-red-100 text-red-800": !projectIsValid,
              })}
            >
              {taskData.endEarly ||
              (taskData.endDate && new Date(taskData.endDate) <= new Date())
                ? "Ended"
                : "Active"}
            </Badge>
            <Badge
              className={cn({
                "bg-blue-100 text-blue-800": taskData.type === "text-to-text",
                "bg-yellow-100 text-yellow-800":
                  taskData.type === "text-classification",
              })}
            >
              {taskData.type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskData.totalCredits.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annotators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentAnnotators} / {taskData.totalAnnotators}
            </div>
            <div className="text-xs text-muted-foreground">
              {progress.toFixed(1)}% complete
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dataset Size</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskData.dataset.length}</div>
            <div className="text-xs text-muted-foreground">items</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">End Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {endDate.toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {isExpired
                ? "Expired"
                : `${Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Annotation Summary</CardTitle>
          <CardDescription>
            This section provides an overview of the annotation task, including
            the dataset and current progress.
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  );
}
