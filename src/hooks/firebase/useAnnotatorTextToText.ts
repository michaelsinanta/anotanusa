"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client/clientApp";

/**
 * Custom hook for managing text-to-text annotator responses, navigation, and completion.
 * @param jobId Firestore job document id
 * @param datasetLength Number of questions/prompts in the dataset
 * @param userId Current user's uid
 * @param minTextLength Minimum required text length for valid responses (default: 3)
 */
export default function useAnnotatorTextToText(
  jobId: string,
  datasetLength: number,
  userId?: string,
  minTextLength = 3,
) {
  const [answers, setAnswers] = useState<{ [userId: string]: string[] }>({});
  const [completed, setCompleted] = useState<{ [userId: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

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
    const firstUnanswered = userAnswers.findIndex(
      (response) => !response || response.trim().length < minTextLength,
    );

    // Only auto-set if currentQuestion is out of bounds or on mount
    if (currentQuestion < 1 || currentQuestion > datasetLength) {
      if (firstUnanswered === -1) {
        setCurrentQuestion(datasetLength); // Stay on last question if all are answered
      } else {
        setCurrentQuestion(firstUnanswered + 1);
      }
    }
    // eslint-disable-next-line
  }, [answers, userId, datasetLength, minTextLength]);

  // Set text response for a question (local only)
  const setTextResponse = useCallback(
    (questionIdx: number, text: string) => {
      if (!userId) return;

      setAnswers((prev) => {
        const userAnswers = prev[userId] ? [...prev[userId]] : [];
        userAnswers[questionIdx] = text;
        return { ...prev, [userId]: userAnswers };
      });

      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new auto-save timeout (save after 3 seconds of inactivity)
      const timeout = setTimeout(() => {
        saveAnswers();
      }, 3000);

      setAutoSaveTimeout(timeout);
    },
    [userId, autoSaveTimeout],
  );

  // Save answers to Firestore
  const saveAnswers = useCallback(async () => {
    if (!jobId || saving) return;

    setSaving(true);
    setError(null);

    try {
      await updateDoc(doc(db, "anotanusa-project", jobId), {
        answers,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.error("Error saving answers:", err);
      setError("Failed to save answers");
      throw err; // Re-throw to handle in navigation methods
    } finally {
      setSaving(false);
    }
  }, [jobId, answers, saving]);

  // Save current answer and navigate to next question
  const goToNext = useCallback(async () => {
    if (currentQuestion >= datasetLength) return;

    try {
      // Save current state before navigating
      await saveAnswers();
      setCurrentQuestion((prev) => Math.min(datasetLength, prev + 1));
    } catch (err) {
      // If save fails, don't navigate
      console.error("Failed to save before navigation:", err);
      setError("Failed to save current answer. Please try again.");
    }
  }, [currentQuestion, datasetLength, saveAnswers]);

  // Save current answer and navigate to previous question
  const goToPrevious = useCallback(async () => {
    if (currentQuestion <= 1) return;

    try {
      // Save current state before navigating
      await saveAnswers();
      setCurrentQuestion((prev) => Math.max(1, prev - 1));
    } catch (err) {
      // If save fails, don't navigate
      console.error("Failed to save before navigation:", err);
      setError("Failed to save current answer. Please try again.");
    }
  }, [currentQuestion, saveAnswers]);

  // Save current answer and navigate to specific question
  const goToQuestion = useCallback(
    async (questionNumber: number) => {
      const targetQuestion = Math.max(
        1,
        Math.min(datasetLength, questionNumber),
      );
      if (targetQuestion === currentQuestion) return;

      try {
        // Save current state before navigating
        await saveAnswers();
        setCurrentQuestion(targetQuestion);
      } catch (err) {
        // If save fails, don't navigate
        console.error("Failed to save before navigation:", err);
        setError("Failed to save current answer. Please try again.");
      }
    },
    [currentQuestion, datasetLength, saveAnswers],
  );

  // Mark as complete in Firestore
  const markComplete = useCallback(async () => {
    if (!jobId || !userId) return;

    setSaving(true);
    setError(null);

    try {
      // First save any pending answers
      await saveAnswers();
    } catch (err) {
      console.error("Error marking complete:", err);
      setError("Failed to mark as complete");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [jobId, userId, completed, answers, saveAnswers]);

  // Manual save function (for save button)
  const saveCurrentAnswer = useCallback(async () => {
    try {
      await saveAnswers();
      // Clear any pending auto-save
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        setAutoSaveTimeout(null);
      }
    } catch (err) {
      console.error("Manual save failed:", err);
    }
  }, [saveAnswers, autoSaveTimeout]);

  // Get current response
  const currentText = userId
    ? answers[userId]?.[currentQuestion - 1] || ""
    : "";

  // Validation helpers
  const isCurrentResponseValid = useCallback(
    (text?: string) => {
      const textToCheck = text !== undefined ? text : currentText;
      return textToCheck.trim().length >= minTextLength;
    },
    [currentText, minTextLength],
  );

  const getValidResponseCount = useCallback(() => {
    if (!userId) return 0;
    const userAnswers = answers[userId] || [];
    return userAnswers.filter(
      (response) => response && response.trim().length >= minTextLength,
    ).length;
  }, [userId, answers, minTextLength]);

  const getAllResponsesValid = useCallback(() => {
    if (!userId) return false;
    const userAnswers = answers[userId] || [];
    return (
      userAnswers.length === datasetLength &&
      userAnswers.every(
        (response) => response && response.trim().length >= minTextLength,
      )
    );
  }, [userId, answers, datasetLength, minTextLength]);

  // Get response statistics
  const getResponseStats = useCallback(() => {
    if (!userId)
      return {
        totalWords: 0,
        totalCharacters: 0,
        averageWords: 0,
        averageCharacters: 0,
        validResponseCount: 0,
      };

    const userAnswers = answers[userId] || [];
    const validResponses = userAnswers.filter(
      (response) => response && response.trim().length >= minTextLength,
    );

    const totalWords = validResponses.reduce((sum, response) => {
      return sum + (response.trim() ? response.trim().split(/\s+/).length : 0);
    }, 0);

    const totalCharacters = validResponses.reduce(
      (sum, response) => sum + response.trim().length,
      0,
    );

    return {
      totalWords,
      totalCharacters,
      averageWords:
        validResponses.length > 0
          ? Math.round(totalWords / validResponses.length)
          : 0,
      averageCharacters:
        validResponses.length > 0
          ? Math.round(totalCharacters / validResponses.length)
          : 0,
      validResponseCount: validResponses.length,
    };
  }, [userId, answers, minTextLength]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Save on page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      // Note: This is synchronous and may not complete
      // Consider using navigator.sendBeacon for critical data
      saveAnswers();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveAnswers, autoSaveTimeout]);

  return {
    // Data
    answers,
    currentText,

    // Actions
    setTextResponse,
    saveAnswers,
    saveCurrentAnswer,
    markComplete,

    // Navigation (now with auto-save)
    currentQuestion,
    setCurrentQuestion,
    goToNext,
    goToPrevious,
    goToQuestion,

    // Validation
    isCurrentResponseValid,
    getAllResponsesValid,
    getValidResponseCount,

    // Statistics
    getResponseStats,

    // State
    loading,
    loadingCompleted,
    saving,
    error,
    completed,

    // Configuration
    minTextLength,
  };
}
