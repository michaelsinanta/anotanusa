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
import useAnnotatorTextToText from "@/hooks/firebase/useAnnotatorTextToText";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

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
            type: data.type ?? "text-to-text",
            description: data.description ?? "",
            creator: data.creatorId ?? "",
            totalCredits: data.totalCredits ?? 0,
            endDate: data.endDate ? new Date(data.endDate) : new Date(),
            totalParticipants: data.totalAnnotators ?? 0,
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
    setTextResponse,
    saveAnswers,
    currentQuestion,
    setCurrentQuestion,
    goToNext,
    goToPrevious,
    currentText,
    loading,
    error,
    completed,
    markComplete,
    loadingCompleted,
  } = useAnnotatorTextToText(jobId, datasetLength, userId);

  if (loadingJob || loading || loadingCompleted) return <div>Loading...</div>;
  if (errorJob || error)
    return <div className="text-red-500">{errorJob || error}</div>;
  if (!user)
    return (
      <div className="text-red-500">You must be logged in to annotate.</div>
    );
  if (userId && completed[userId]) {
    router.replace("/annotator");
    return (
      <div className="text-green-600">
        You have completed this test. Redirecting...
      </div>
    );
  }

  const totalQuestions = datasetLength;
  const currentDataPoint = jobs?.dataset?.[currentQuestion - 1];

  const handleSubmit = async () => {
    await saveAnswers();
    goToNext();
  };

  const handleComplete = async () => {
    await saveAnswers();
    await markComplete();
    router.replace("/annotator");
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
              Fill the text area below with suitable answer using Indonesian
              Local Language.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-lg bg-gray-100 p-4">
              <p className="mb-2 text-sm font-medium text-gray-600">
                Question:
              </p>
              <p className="text-gray-800">{currentDataPoint?.text}</p>
            </div>
          </CardContent>
        </Card>

        {/* Options Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fill the text area below</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                value={currentText}
                onChange={(e) =>
                  setTextResponse(currentQuestion - 1, e.target.value)
                }
                placeholder="Type your translation or response here..."
                className="min-h-32 resize-none text-base leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
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
              disabled={!currentText}
              className="gap-2 bg-green-600 text-white"
            >
              Complete the test
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!currentText}
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
