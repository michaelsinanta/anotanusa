"use client";

import type React from "react";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpDown,
  RotateCcw,
  Save,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import RankingCard from "../ranking-card";
import useAnnotatorRanking from "@/hooks/firebase/useAnnotatorTextRanking";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Job } from "@/types/job";
import { db } from "@/lib/firebase/client/clientApp";
import { useUser } from "@/hooks/firebase/useUser";
import { getDoc, doc } from "firebase/firestore";

export default function TextRankingForm() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job>();
  const [loadingJob, setLoadingJob] = useState(true);
  const [errorJob, setErrorJob] = useState<string | null>(null);
  const user = useUser();

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
    currentRanking,
    setRanking,
    currentQuestion,
    goToNext,
    goToPrevious,
    saveCurrentRanking,
    markComplete,
    getCompletedRankingCount,
    getAllRankingsValid,
    isCurrentRankingValid,
    saving,
    error,
    completed,
  } = useAnnotatorRanking(id, datasetLength, userId);

  const currentDataPoint = jobs?.dataset?.[currentQuestion - 1];
  const labelResults = currentDataPoint?.choices;

  // Initialize ranking if empty
  useEffect(() => {
    if (
      currentRanking.length === 0 &&
      labelResults &&
      labelResults.length > 0
    ) {
      setRanking(
        currentQuestion - 1,
        labelResults.map((_, index) => index),
      );
    }
  }, [currentRanking, labelResults, currentQuestion, setRanking]);

  // Ranking functions
  const handleDragStart = useCallback((e: React.DragEvent, id: number) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (draggedItem === null) return;

      const dragIndex = currentRanking.indexOf(draggedItem);
      if (dragIndex === -1) return;

      const newRanking = [...currentRanking];
      const [draggedElement] = newRanking.splice(dragIndex, 1);
      newRanking.splice(dropIndex, 0, draggedElement);

      setRanking(currentQuestion - 1, newRanking);
      setDraggedItem(null);
      setDragOverIndex(null);
    },
    [draggedItem, currentRanking, setRanking, currentQuestion],
  );

  const resetRanking = useCallback(() => {
    const originalOrder = labelResults?.map((_, index) => index);
    if (originalOrder) {
      setRanking(currentQuestion - 1, originalOrder);
    }
  }, [labelResults, setRanking, currentQuestion]);

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newRanking = [...currentRanking];
      [newRanking[index - 1], newRanking[index]] = [
        newRanking[index],
        newRanking[index - 1],
      ];
      setRanking(currentQuestion - 1, newRanking);
    },
    [currentRanking, setRanking, currentQuestion],
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index === currentRanking.length - 1) return;
      const newRanking = [...currentRanking];
      [newRanking[index], newRanking[index + 1]] = [
        newRanking[index + 1],
        newRanking[index],
      ];
      setRanking(currentQuestion - 1, newRanking);
    },
    [currentRanking, setRanking, currentQuestion],
  );

  // Handle submit and complete
  const handleSubmit = async () => {
    await saveCurrentRanking();
    goToNext();
  };

  const handleComplete = async () => {
    await saveCurrentRanking();
    await markComplete();
    router.push("/annotator");
  };

  if (saving) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Save className="mx-auto mb-4 h-8 w-8 animate-pulse text-blue-600" />
          <p className="text-lg font-medium">Saving your rankings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (userId && completed[userId]) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-green-600">
          <CheckCircle className="mx-auto mb-4 h-12 w-12" />
          <p className="mb-4 text-xl font-medium">
            You have completed this task!
          </p>
          <Button asChild>
            <Link href="/annotator">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const progress = (currentQuestion / datasetLength) * 100;
  const totalCompleted = getCompletedRankingCount();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/annotator"
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">{jobs?.name}</h1>
          <p className="mb-2 text-gray-600">{jobs?.description}</p>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Task {currentQuestion} of {datasetLength}
            </span>
            <span className="text-sm text-gray-600">
              {totalCompleted} of {datasetLength} completed
            </span>
          </div>
          <Progress value={progress} className="mb-6 h-2" />
        </div>

        {/* Original Text */}
        {currentDataPoint?.text && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Question</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-gray-100 p-4">
                <p className="text-gray-800">{currentDataPoint.text}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking Interface */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowUpDown className="h-5 w-5" />
                Rank the options from best to worst
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={resetRanking}
                className="flex items-center gap-2 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentRanking.map((resultIndex, position) => {
              const result = labelResults?.[resultIndex];
              if (!result) return null;

              return (
                <div
                  key={resultIndex}
                  className={`relative ${dragOverIndex === position ? "border-t-2 border-blue-500" : ""}`}
                  onDragOver={(e) => handleDragOver(e, position)}
                  onDrop={(e) => handleDrop(e, position)}
                >
                  <RankingCard
                    id={resultIndex}
                    label={result}
                    rank={position + 1}
                    isDragging={draggedItem === resultIndex}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />

                  {/* Mobile-friendly buttons */}
                  <div className="absolute top-1/2 right-2 flex -translate-y-1/2 transform flex-col gap-1 md:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveUp(position)}
                      disabled={position === 0}
                      className="h-6 w-6 p-0"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveDown(position)}
                      disabled={position === currentRanking.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> Drag and drop the cards to rank
                them from best (top) to worst (bottom). On mobile, use the arrow
                buttons.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            onClick={goToPrevious}
            disabled={currentQuestion === 1 || saving}
            variant="outline"
            className="gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentQuestion === datasetLength ? (
            <Button
              onClick={handleComplete}
              disabled={!isCurrentRankingValid() || saving}
              className="gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Complete Task
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isCurrentRankingValid() || saving}
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
