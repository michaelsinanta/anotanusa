"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client/clientApp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Save } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Job } from "@/types/job";
import { useUser } from "@/hooks/firebase/useUser";
import useAnnotatorAnswers from "@/hooks/firebase/useAnnotatorAnswers";
import { useRouter } from "next/navigation";

export default function TextClassificationForm() {
  const params = useParams();
  const id = params?.id as string;

  const [jobs, setJobs] = useState<Job>();
  const [loadingJob, setLoadingJob] = useState(true);
  const [errorJob, setErrorJob] = useState<string | null>(null);
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    setLoadingJob(true);
    getDoc(doc(db, "anotanusa-project", id))
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const project = {
            id: docSnap.id,
            name: data.title ?? "Untitled",
            type: data.annotationTask ?? "text-classification",
            description: data.description ?? "",
            creator: data.creatorId ?? "",
            totalCredits: data.credit ?? 0,
            endDate: data.dueDate ? new Date(data.dueDate) : new Date(),
            totalParticipants: data.totalAnnotator ?? 0,
            answers: new Map(Object.entries(data.answers ?? {})),
            dataset: data.dataset ?? [],
          } as unknown as Job;
          setJobs(project);
        } else {
          setErrorJob("Project not found");
        }
      })
      .catch((err) => setErrorJob(err.message))
      .finally(() => setLoadingJob(false));
  }, [id]);

  const datasetLength = jobs?.dataset?.length ?? 0;
  const jobId = jobs?.id?.toString() ?? "";
  const userId = user?.uid;

  const {
    answers,
    setAnswer,
    saveAnswers,
    currentQuestion,
    setCurrentQuestion,
    goToNext,
    goToPrevious,
    selectedOption,
    loading,
    error,
    completed,
    markComplete,
    loadingCompleted,
  } = useAnnotatorAnswers(jobId, datasetLength, userId);

  if (loadingJob || loading || loadingCompleted) return <div>Loading...</div>;
  if (errorJob || error)
    return <div className="text-red-500">{errorJob || error}</div>;
  if (!user)
    return (
      <div className="text-red-500">You must be logged in to annotate.</div>
    );
  if (userId && completed[userId]) {
    router.replace("/annotator/job");
    return (
      <div className="text-green-600">
        You have completed this test. Redirecting...
      </div>
    );
  }

  const totalQuestions = datasetLength;
  const currentDataPoint = jobs?.dataset?.[currentQuestion - 1];

  const handleOptionChange = (optionId: string) => {
    setAnswer(currentQuestion - 1, optionId);
  };

  const handleSubmit = async () => {
    await saveAnswers();
    goToNext();
  };

  const handleComplete = async () => {
    await saveAnswers();
    await markComplete();
    router.replace("/annotator/job");
  };

  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{jobs?.name}</h1>
            <Badge variant="outline">
              Question {currentQuestion} of {totalQuestions}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">{jobs?.description}</CardTitle>
            <CardDescription>
              Select the most appropriate option. You can choose only one
              answer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-lg bg-gray-100 p-4">
              <p className="mb-2 text-sm font-medium text-gray-600">
                Text to annotate:
              </p>
              <p className="text-gray-800">{currentDataPoint?.text}</p>
            </div>
          </CardContent>
        </Card>

        {/* Options Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select applicable labels</CardTitle>
            <CardDescription>
              {selectedOption ? "1 option selected" : "No option selected"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedOption}
              onValueChange={handleOptionChange}
            >
              <div className="space-y-4">
                {currentDataPoint?.choices.map((choice, index) => {
                  const isSelected = selectedOption === choice;
                  return (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                        isSelected
                          ? "border-blue-200 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem
                        value={choice}
                        id={`choice-${index}`}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={`choice-${index}`}
                          className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {choice}
                        </Label>
                      </div>
                      {isSelected && (
                        <CheckCircle className="mt-1 h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={goToPrevious}
            disabled={currentQuestion === 1}
            className="gap-2"
          >
            Previous
          </Button>
          {currentQuestion === totalQuestions ? (
            <Button
              onClick={handleComplete}
              disabled={!selectedOption}
              className="gap-2 bg-green-600 text-white"
            >
              Complete the test
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Submit & Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
