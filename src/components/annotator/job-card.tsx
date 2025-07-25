"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  FileText,
  Target,
  Users,
  Calendar,
  DollarSign,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import JobDetailsDialog from "./job-details";
import { Job } from "@/types/job";
import { useUser } from "@/hooks/firebase/useUser";

function getDollarBadge(creditPerTask: number) {
  if (creditPerTask >= 10) {
    return (
      <span className="inline-flex items-center rounded bg-green-200 px-2 py-0.5 text-xs font-bold text-green-900">
        <DollarSign className="green-900 mr-0.5 h-4 w-4" />
        <DollarSign className="green-900 mr-0.5 h-4 w-4" />
        <DollarSign className="green-900 h-4 w-4" />
      </span>
    );
  } else if (creditPerTask >= 5) {
    return (
      <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
        <DollarSign className="green-800 mr-0.5 h-4 w-4" />
        <DollarSign className="green-800 h-4 w-4" />
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        <DollarSign className="green-700 h-4 w-4" />
      </span>
    );
  }
}

export default function JobCard({ job }: { job: Job }) {
  const user = useUser();
  const dueDate = new Date(job.endDate);
  const isOverdue = new Date() > dueDate;
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );
  const userProgress = job.answers?.get(user?.uid ?? "")?.length ?? 0;
  const userProgressPercentage = Math.round(
    (userProgress / (job.dataset?.length ?? 0)) * 100,
  );
  const creditPerTask = job.totalCredits / job.totalAnnotators;

  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-0">
        <div className="mb-1 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {job.name}
            </h3>
            <p className="mb-3 text-sm text-gray-600">{job.description}</p>

            <div className="mb-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {(() => {
                  switch (job.type) {
                    case "text-to-text":
                      return (
                        <>
                          <FileText className="mr-1 h-3 w-3" />
                          Text-to-Text
                        </>
                      );
                    case "text-classification":
                      return (
                        <>
                          <Target className="mr-1 h-3 w-3" />
                          Text Classification
                        </>
                      );
                    case "text-ranking":
                      return (
                        <>
                          <Crown className="mr-1 h-3 w-3" />
                          Text Ranking
                        </>
                      );
                    default:
                      return null;
                  }
                })()}
              </Badge>
              {getDollarBadge(creditPerTask)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Project Progress */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Current Participants
            </span>
            <span className="text-sm text-gray-500">
              {job.answers?.size}/{job.totalAnnotators} participants
            </span>
          </div>
          <Progress
            value={((job.answers?.size || 0) / job.totalAnnotators) * 100}
            className="mb-1 h-2"
          />
          <div className="text-xs text-gray-600">
            {(((job.answers?.size || 0) / job.totalAnnotators) * 100).toFixed(
              2,
            )}
            %
          </div>
        </div>

        {/* My Progress */}
        {userProgress > 0 && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                My Progress
              </span>
              <span className="text-sm text-blue-700">
                {userProgressPercentage}%
              </span>
            </div>
            <Progress value={userProgressPercentage} className="mb-1 h-2" />
          </div>
        )}

        {/* Job Details */}
        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Total Rewards:</span>
            <span className="font-medium text-green-600">
              {job.totalCredits}$
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Participants:</span>
            <span className="font-medium">{job.totalAnnotators}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Due:</span>
            <span
              className={`font-medium whitespace-nowrap ${
                isOverdue
                  ? "text-red-600"
                  : daysUntilDue <= 3
                    ? "text-yellow-600"
                    : "text-gray-700"
              }`}
            >
              {dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {userProgressPercentage < 100 && (
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/annotator/job/${job.id}`}>
                {userProgressPercentage > 0 ? "Continue Work" : "Start Work"}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
            >
              Details
            </Button>
          </div>
        )}

        {/* Creator Info */}
        {/* TODO : Modify creator info */}
        <div className="mt-3 border-t pt-3 text-xs text-gray-500">
          Created by <span className="font-medium">{job.creator}</span>
        </div>
      </CardContent>
      {user && (
        <JobDetailsDialog
          job={job}
          open={showDetails}
          onOpenChange={setShowDetails}
          user={user}
        />
      )}
    </Card>
  );
}
