import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TaskData } from "@/lib/types/project";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarDays, Coins, Eye, Users } from "lucide-react";
import Link from "next/link";

interface TaskCardProps {
  data: TaskData;
}

export default function TaskCard({ data }: TaskCardProps) {
  const progressPercentage =
    (data.currentAnnotators / data.totalAnnotators) * 100;

  const projectIsValid =
    !data.endEarly ||
    new Date(data.endDate) > new Date() ||
    data.currentAnnotators < data.totalAnnotators;

  return (
    <Card className="w-full gap-2 border-0 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex gap-2 text-base leading-tight font-semibold">
              {data.title}
            </CardTitle>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Badge
              className={cn({
                "bg-green-100 text-green-800": projectIsValid,
                "bg-red-100 text-red-800": !projectIsValid,
              })}
            >
              {data.endEarly ||
              (data.endDate && new Date(data.endDate) <= new Date())
                ? "Ended"
                : "Active"}
            </Badge>
            <Badge
              className={cn({
                "bg-blue-100 text-blue-800": data.type === "text-to-text",
                "bg-yellow-100 text-yellow-800":
                  data.type === "text-classification",
              })}
            >
              {data.type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Due:</span>
            {data.endDate ? format(new Date(data.endDate), "PPP") : "N/A"}
          </div>

          <div className="flex items-center gap-1.5">
            <Coins className="h-3 w-3 shrink-0 text-yellow-500" />
            <span className="text-muted-foreground">Reward:</span>
            <span className="font-semibold">{data.totalCredits}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-start gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Contributors</span>
            </div>
            <span className="font-medium">
              {data.currentAnnotators}/{data.totalAnnotators}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={`/creator/tasks/${data.creatorId}`}
            className="group inline-flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/80"
          >
            <Eye className="h-3 w-3 transition-transform group-hover:scale-110" />
            View Details
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
