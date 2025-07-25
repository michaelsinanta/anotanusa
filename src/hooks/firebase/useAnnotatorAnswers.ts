import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client/clientApp";

/**
 * Custom hook for managing annotator answers, navigation, and completion.
 * @param jobId Firestore job document id
 * @param datasetLength Number of questions in the dataset
 * @param userId Current user's uid
 */
export default function useAnnotatorAnswers(
  jobId: string,
  datasetLength: number,
  userId?: string,
) {
  const [answers, setAnswers] = useState<{ [userId: string]: string[] }>({});
  const [completed, setCompleted] = useState<{ [userId: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);

  // Load answers and completed from Firestore
  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    setLoadingCompleted(true);
    getDoc(doc(db, "anotanusa-project", jobId))
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAnswers(data.answers ?? {});
          setCompleted(data.completed ?? {});
        } else {
          setError("Project not found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
        setLoadingCompleted(false);
      });
  }, [jobId]);

  // Set currentQuestion to first unanswered for this user
  useEffect(() => {
    if (!userId || !datasetLength) return;
    const userAnswers = answers[userId] || [];
    const firstUnanswered = userAnswers.findIndex((ans) => !ans);
    // Only auto-set if currentQuestion is out of bounds or on mount
    if (currentQuestion < 1 || currentQuestion > datasetLength) {
      if (firstUnanswered === -1) {
        setCurrentQuestion(datasetLength); // Stay on last question if all are answered
      } else {
        setCurrentQuestion(firstUnanswered + 1);
      }
    }
    // else, do not auto-reset currentQuestion
    // eslint-disable-next-line
  }, [answers, userId, datasetLength]);

  // Set answer for a question (local only)
  const setAnswer = useCallback(
    (questionIdx: number, value: string) => {
      if (!userId) return;
      setAnswers((prev) => {
        const userAnswers = prev[userId] ? [...prev[userId]] : [];
        userAnswers[questionIdx] = value;
        return { ...prev, [userId]: userAnswers };
      });
    },
    [userId],
  );

  // Save answers to Firestore
  const saveAnswers = useCallback(async () => {
    if (!jobId) return;
    await updateDoc(doc(db, "anotanusa-project", jobId), {
      answers,
    });
  }, [jobId, answers]);

  // Mark as complete in Firestore
  const markComplete = useCallback(async () => {
    if (!jobId || !userId) return;
    const newCompleted = { ...completed, [userId]: true };
    setCompleted(newCompleted);
    await updateDoc(doc(db, "anotanusa-project", jobId), {
      completed: newCompleted,
    });
  }, [jobId, userId, completed]);

  // Navigation helpers
  const goToNext = useCallback(() => {
    setCurrentQuestion((prev) => Math.min(datasetLength, prev + 1));
  }, [datasetLength]);

  const goToPrevious = useCallback(() => {
    setCurrentQuestion((prev) => Math.max(1, prev - 1));
  }, []);

  // Selected answer for current question
  const selectedOption = userId
    ? answers[userId]?.[currentQuestion - 1] || ""
    : "";

  return {
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
  };
}
