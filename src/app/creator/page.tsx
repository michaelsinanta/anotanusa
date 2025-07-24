"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Calendar, MoreVertical, Plus, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const dummyProjects = [
  {
    id: 1,
    name: "Indo to Java",
    type: "Text-to-Text",
    due: new Date("2024-01-15"),
    total_data: 166,
    current_progress: 100,
  },
  {
    id: 2,
    name: "Indo to Bali",
    type: "Text-to-Text",
    due: new Date("2026-01-15"),
    total_data: 166,
    current_progress: 80,
  },
];

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return "bg-green-500";
  if (percentage >= 70) return "bg-blue-500";
  if (percentage >= 40) return "bg-yellow-500";
  return "bg-gray-400";
};

export default function CreatorDashboard() {
  const [searchQUery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState(dummyProjects);

  // const handleSearch = (e: any) => {
  //   const keyword = e.target.value
  //   setSearchQuery(keyword);
  //   const filtered = dummyProjects.filter(project =>
  //     project.name.toLowerCase().includes(keyword.toLowerCase())
  //   );
  //   setProjects(filtered);
  // }

  return (
    <div className="p-8">
      {/* Header */}
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

      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <Input
          placeholder="Search projects"
          className="max-w-sm"
          value={searchQUery}
          // onChange={handleSearch}
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Target className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-lg font-medium">No projects found</p>
            <p className="text-sm">Create your first project to get started</p>
          </div>
        ) : (
          projects.map((project) => {
            const progressPercentage = Math.round(
              (project.current_progress / project.total_data) * 100,
            );
            const isOverdue = new Date() > project.due;
            const daysUntilDue = Math.ceil(
              (project.due.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            );

            return (
              <Card
                key={project.id}
                className="group relative border-0 bg-white shadow-sm transition-all duration-200 hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-2 truncate text-lg font-semibold text-gray-900">
                        {project.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`text-xs font-medium`}
                      >
                        {project.type}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {project.current_progress}
                          <span className="text-sm font-normal text-gray-500">
                            /{project.total_data}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {progressPercentage}% complete
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <Progress
                        value={progressPercentage}
                        className="h-2 bg-gray-100"
                      />
                      <div
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Due Date Section */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Due:</span>
                    <span
                      className={`font-medium ${
                        isOverdue
                          ? "text-red-600"
                          : daysUntilDue <= 3
                            ? "text-yellow-600"
                            : "text-gray-700"
                      }`}
                    >
                      {project.due.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {!isOverdue && daysUntilDue <= 7 && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {daysUntilDue === 0
                          ? "Due today"
                          : `${daysUntilDue}d left`}
                      </Badge>
                    )}
                    {isOverdue && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
