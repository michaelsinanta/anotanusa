"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/actions/creator";
import { ArrowLeft, FileText, Target } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export default function NewProjectPage() {
  const [state, formAction, isPending] = useActionState(createProject, {
    message: "",
    isError: false,
    isValid: false,
  });

  useEffect(() => {
    if (state.isError) {
      toast.error(state.message);
    } else if (state.isValid) {
      toast.success("Project created successfully!");
    }
  }, [state.isError, state.isValid]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <Header />

        <form className="flex flex-col gap-6" action={formAction}>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-1 flex-col gap-6 lg:flex-[2]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Indo to Java Translation"
                      required
                      disabled={isPending}
                    />
                    {state.validationErrors &&
                      state.validationErrors.fieldErrors.title && (
                        <div>
                          {state.validationErrors.fieldErrors.title.map(
                            (error, index) => (
                              <p key={index} className="text-sm text-red-500">
                                {error}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your project goals and requirements..."
                      rows={3}
                      required
                      disabled={isPending}
                    />
                    {state.validationErrors &&
                      state.validationErrors.fieldErrors.description && (
                        <div>
                          {state.validationErrors.fieldErrors.description.map(
                            (error, index) => (
                              <p key={index} className="text-sm text-red-500">
                                {error}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="annotationTask">Annotation Task</Label>
                    <Select required disabled={isPending} name="annotationTask">
                      <SelectTrigger>
                        <SelectValue placeholder="Select annotation task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-to-text">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Text-to-Text
                          </div>
                        </SelectItem>
                        <SelectItem value="text-classification">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Text Classification
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {state.validationErrors &&
                      state.validationErrors.fieldErrors.annotationTask && (
                        <div>
                          {state.validationErrors.fieldErrors.annotationTask.map(
                            (error, index) => (
                              <p key={index} className="text-sm text-red-500">
                                {error}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      className="w-fit"
                      required
                      disabled={isPending}
                    />
                    {state.validationErrors &&
                      state.validationErrors.fieldErrors.dueDate && (
                        <div>
                          {state.validationErrors.fieldErrors.dueDate.map(
                            (error, index) => (
                              <p key={index} className="text-sm text-red-500">
                                {error}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reward">Credit Reward</Label>
                    <div>
                      <Input
                        id="reward"
                        name="reward"
                        type="number"
                        placeholder="0"
                        min="1"
                        className="w-fit"
                        required
                      />
                    </div>
                    {state.validationErrors &&
                      state.validationErrors.fieldErrors.reward && (
                        <div>
                          {state.validationErrors.fieldErrors.reward.map(
                            (error, index) => (
                              <p key={index} className="text-sm text-red-500">
                                {error}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                    <p className="mt-1 text-xs text-gray-500">
                      Credits will be distributed to annotators
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="maxContributors">
                      Maximum Contributors
                    </Label>
                    <div>
                      <Input
                        id="maxContributors"
                        name="maxContributors"
                        type="number"
                        placeholder="0"
                        min="1"
                        className="w-fit"
                        required
                      />
                    </div>
                    {state.validationErrors &&
                      state.validationErrors.fieldErrors.maxContributors && (
                        <div>
                          {state.validationErrors.fieldErrors.maxContributors.map(
                            (error, index) => (
                              <p key={index} className="text-sm text-red-500">
                                {error}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum number of contributors for this project
                    </p>
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-3">
                    <Label htmlFor="file">CSV File</Label>
                    <Input id="file" name="file" type="file" accept=".csv" />
                    {state.validationErrors &&
                      state.validationErrors.fieldErrors.file && (
                        <div>
                          {state.validationErrors.fieldErrors.file.map(
                            (error, index) => (
                              <p key={index} className="text-sm text-red-500">
                                {error}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6">
            <Button type="button" variant="outline" asChild>
              <Link href="/creator">Cancel</Link>
            </Button>
            <Button type="submit" className="min-w-32" disabled={isPending}>
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-8">
      <Link
        href="/creator"
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Create New Project
      </h1>
      <p className="text-gray-600">
        Set up your annotation project with dataset and requirements
      </p>
    </div>
  );
}
