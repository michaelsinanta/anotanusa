import { DownloadButton } from "@/components/projects/download";
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

  try {
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
                  The task you&apos;re looking for doesn&apos;t exist or has
                  been removed.
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
    const currentAnnotators = Object.keys(taskData.answers || {}).length;
    const progress =
      taskData.totalAnnotators > 0
        ? (currentAnnotators / taskData.totalAnnotators) * 100
        : 0;

    const projectIsValid =
      !taskData.endEarly ||
      new Date(taskData.endDate) > new Date() ||
      currentAnnotators < taskData.totalAnnotators;

    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {taskData.title}
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                {taskData.description}
              </p>
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
              <CardTitle className="text-sm font-medium">
                Total Credits
              </CardTitle>
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
              <CardTitle className="text-sm font-medium">
                Dataset Size
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {taskData.dataset.length}
              </div>
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
            <CardTitle>Annotation Statistics</CardTitle>
            <CardDescription>
              Distribution of user responses across the dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Global Statistics */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-700">
                  Global Answer Distribution
                </h4>
                <div className="space-y-4">
                  {(() => {
                    const globalCounts: Record<string, number> = {};
                    let totalAnswers = 0;

                    // Count all answers globally
                    if (
                      taskData.answers &&
                      typeof taskData.answers === "object"
                    ) {
                      Object.values(
                        taskData.answers as Record<string, string[]>,
                      ).forEach((userAnswers) => {
                        if (Array.isArray(userAnswers)) {
                          userAnswers.forEach((answer) => {
                            if (typeof answer === "string") {
                              globalCounts[answer] =
                                (globalCounts[answer] || 0) + 1;
                              totalAnswers++;
                            }
                          });
                        }
                      });
                    }

                    const sortedEntries = Object.entries(globalCounts).sort(
                      ([, a], [, b]) => b - a,
                    );
                    const maxCount =
                      sortedEntries.length > 0 ? sortedEntries[0][1] : 0;

                    if (sortedEntries.length === 0) {
                      return (
                        <div className="flex h-32 items-center justify-center text-gray-500">
                          <p>No annotation data available yet</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {sortedEntries.map(([answer, count]) => {
                          const percentage =
                            totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;
                          const barWidth =
                            maxCount > 0 ? (count / maxCount) * 100 : 0;

                          return (
                            <div key={answer} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium capitalize">
                                  {answer}
                                </span>
                                <span className="text-gray-600">
                                  {count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="h-6 w-full rounded-full bg-gray-200">
                                <div
                                  className="h-6 rounded-full bg-blue-500 transition-all duration-300"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Summary stats below chart */}
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {(() => {
                    const globalCounts: Record<string, number> = {};
                    let totalAnswers = 0;

                    if (
                      taskData.answers &&
                      typeof taskData.answers === "object"
                    ) {
                      Object.values(
                        taskData.answers as Record<string, string[]>,
                      ).forEach((userAnswers) => {
                        if (Array.isArray(userAnswers)) {
                          userAnswers.forEach((answer) => {
                            if (typeof answer === "string") {
                              globalCounts[answer] =
                                (globalCounts[answer] || 0) + 1;
                              totalAnswers++;
                            }
                          });
                        }
                      });
                    }

                    return (
                      <>
                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                          <div className="text-lg font-semibold">
                            {totalAnswers}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Responses
                          </div>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                          <div className="text-lg font-semibold">
                            {Object.keys(globalCounts).length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Unique Labels
                          </div>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                          <div className="text-lg font-semibold">
                            {Object.keys(globalCounts).length > 0
                              ? Object.entries(globalCounts).sort(
                                  ([, a], [, b]) => b - a,
                                )[0][0]
                              : "N/A"}
                          </div>
                          <div className="text-sm text-gray-600">Majority</div>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                          <div className="text-lg font-semibold">
                            {totalAnswers > 0 &&
                            Object.keys(globalCounts).length > 0
                              ? (
                                  totalAnswers /
                                  Object.keys(globalCounts).length
                                ).toFixed(1)
                              : "0"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Avg per Label
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Annotator Participation */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-700">
                  Annotator Participation
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-3 text-center">
                    <div className="text-lg font-semibold text-blue-700">
                      {
                        Object.keys(
                          taskData.answers as Record<string, string[]>,
                        ).length
                      }
                    </div>
                    <div className="text-sm text-blue-600">
                      Active Annotators
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3 text-center">
                    <div className="text-lg font-semibold text-green-700">
                      {(() => {
                        const userAnswers = Object.values(
                          taskData.answers as Record<string, string[]>,
                        );
                        return userAnswers.length > 0
                          ? Math.round(
                              userAnswers.reduce(
                                (sum, answers) => sum + answers.length,
                                0,
                              ) / userAnswers.length,
                            )
                          : 0;
                      })()}
                    </div>
                    <div className="text-sm text-green-600">
                      Avg. Responses per User
                    </div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-3 text-center">
                    <div className="text-lg font-semibold text-purple-700">
                      {(() => {
                        const completionRates = Object.values(
                          taskData.answers as Record<string, string[]>,
                        ).map(
                          (answers) =>
                            (answers.length / taskData.dataset.length) * 100,
                        );
                        return completionRates.length > 0
                          ? Math.round(
                              completionRates.reduce(
                                (sum, rate) => sum + rate,
                                0,
                              ) / completionRates.length,
                            )
                          : 0;
                      })()}
                      %
                    </div>
                    <div className="text-sm text-purple-600">
                      Avg. Completion Rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-item Statistics */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Per-Item Answer Distribution
                  </h4>
                  <DownloadButton taskData={taskData} />
                </div>
                <div className="max-h-96 space-y-4 overflow-y-auto">
                  {taskData.dataset.map((item, itemIndex) => {
                    // Get all answers for this specific item index
                    const itemAnswers: string[] = [];
                    Object.values(
                      taskData.answers as Record<string, string[]>,
                    ).forEach((userAnswers) => {
                      if (userAnswers[itemIndex]) {
                        itemAnswers.push(userAnswers[itemIndex]);
                      }
                    });

                    // Count answers for this item
                    const itemCounts: Record<string, number> = {};
                    itemAnswers.forEach((answer) => {
                      itemCounts[answer] = (itemCounts[answer] || 0) + 1;
                    });

                    const totalItemAnswers = itemAnswers.length;
                    const majorityAnswer = Object.entries(itemCounts).sort(
                      ([, a], [, b]) => b - a,
                    )[0];

                    return (
                      <div key={itemIndex} className="rounded-lg border p-4">
                        <div className="mb-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Item {itemIndex + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {totalItemAnswers} responses
                              </Badge>
                              {majorityAnswer && (
                                <Badge variant="default">
                                  Top: {majorityAnswer[0]} (
                                  {(
                                    (majorityAnswer[1] / totalItemAnswers) *
                                    100
                                  ).toFixed(0)}
                                  %)
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="truncate text-sm text-gray-600">
                            {item.text}
                          </p>
                        </div>

                        {totalItemAnswers > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(itemCounts)
                              .sort(([, a], [, b]) => b - a)
                              .map(([answer, count]) => (
                                <div
                                  key={answer}
                                  className="flex items-center gap-1"
                                >
                                  <Badge
                                    variant="secondary"
                                    className="capitalize"
                                  >
                                    {answer}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {count} (
                                    {((count / totalItemAnswers) * 100).toFixed(
                                      0,
                                    )}
                                    %)
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No responses yet
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error fetching task:", error);
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Error loading task
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There was an error loading the task. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
