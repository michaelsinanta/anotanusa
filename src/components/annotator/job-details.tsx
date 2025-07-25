"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Target,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
  Building,
  DollarSign,
} from "lucide-react";
import { Job } from "@/types/job";
import { User } from "firebase/auth";

interface JobDetailsDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

function getDollarBadge(creditPerTask: number) {
  if (creditPerTask >= 10) {
    return (
      <span className="inline-flex items-center rounded bg-green-200 px-3 py-1 text-sm font-bold text-green-900">
        <DollarSign className="green-900 mr-0.5 h-4 w-4" />
        <DollarSign className="green-900 mr-0.5 h-4 w-4" />
        <DollarSign className="green-900 h-4 w-4" />
      </span>
    );
  } else if (creditPerTask >= 5) {
    return (
      <span className="inline-flex items-center rounded bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
        <DollarSign className="green-800 mr-0.5 h-4 w-4" />
        <DollarSign className="green-800 h-4 w-4" />
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center rounded bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
        <DollarSign className="green-700 h-4 w-4" />
      </span>
    );
  }
}

export default function JobDetailsDialog({
  job,
  open,
  user,
  onOpenChange,
}: JobDetailsDialogProps) {
  if (!job) return null;

  const dueDate = new Date(job.endDate);
  const isOverdue = new Date() > dueDate;
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );
  const userProgress = job.answers?.get(user?.uid ?? "")?.length ?? 0;
  const userProgressPercentage = Math.round(
    (userProgress / (job.dataset?.length ?? 0)) * 100,
  );
  const creditPerTask = (job.totalCredits / job.totalAnnotators).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="mb-2 text-2xl font-bold text-gray-900">
                {job.name}
              </DialogTitle>
              <p className="text-base leading-relaxed text-gray-600">
                {job.description}
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {job.type === "text-to-text" ? (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Text-to-Text
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Text Classification
                </>
              )}
            </Badge>
            {getDollarBadge(parseFloat(creditPerTask))}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Creator Info */}
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <Building className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{job.creator}</div>
              <div className="text-sm text-gray-500">Project Creator</div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <TrendingUp className="h-5 w-5" />
              Progress Overview
            </h3>

            {/* Overall Progress */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  Current Participants
                </span>
                <span className="text-sm text-gray-500">
                  {job.answers?.size} / {job.totalAnnotators} participants
                </span>
              </div>
              <Progress value={job.answers?.size} className="mb-2 h-3" />
              <div className="text-xs text-gray-600">
                {((job.answers?.size || 0) / job.totalAnnotators) * 100}%
              </div>
            </div>

            {/* My Progress */}
            {userProgressPercentage > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-blue-900">
                    My Contribution
                  </span>
                  <span className="text-sm text-blue-700">
                    {userProgressPercentage}%
                  </span>
                </div>
                <Progress value={userProgressPercentage} className="mb-2 h-3" />
              </div>
            )}
          </div>

          {/* Job Details Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Reward per Task</div>
                  <div className="font-semibold text-green-600">
                    {creditPerTask}$
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Participants</div>
                  <div className="font-semibold">
                    {job.totalAnnotators} annotators
                  </div>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 rounded-lg border p-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Due Date</div>
                  <div
                    className={`font-semibold ${
                      isOverdue
                        ? "text-red-600"
                        : daysUntilDue <= 3
                          ? "text-yellow-600"
                          : "text-gray-900"
                    }`}
                  >
                    {dueDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  {!isOverdue && daysUntilDue <= 7 && (
                    <div className="text-xs text-yellow-600">
                      {daysUntilDue === 0
                        ? "Due today"
                        : `${daysUntilDue} days left`}
                    </div>
                  )}
                  {isOverdue && (
                    <div className="text-xs text-red-600">Overdue</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <>
              <Button className="flex-1" size="lg">
                {userProgressPercentage > 0
                  ? "Continue Work"
                  : "Take Preliminary Test"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
