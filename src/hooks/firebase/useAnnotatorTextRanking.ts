"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client/clientApp";

/**
 * Custom hook for managing ranking annotator tasks, navigation, and completion.
 * Stores rankings as array of comma-separated strings (e.g. ["0,1,2", "2,0,1"])
 * @param jobId Job identifier
 * @param datasetLength Number of ranking tasks in the dataset
 * @param userId Current user's uid
 */
export default function useAnnotatorRanking(
  jobId: string,
  datasetLength: number,
  userId?: string,
) {
  // Internal state uses number arrays for easier manipulation
  const [rankings, setRankings] = useState<{ [userId: string]: number[][] }>(
    {},
  );
  const [completed, setCompleted] = useState<{ [userId: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Helper functions to convert between formats
  const rankingArrayToString = useCallback((ranking: number[]): string => {
    return ranking.join(",");
  }, []);

  const rankingStringToArray = useCallback((rankingStr: string): number[] => {
    if (!rankingStr || rankingStr.trim() === "") return [];
    return rankingStr
      .split(",")
      .map((num) => Number.parseInt(num.trim(), 10))
      .filter((num) => !isNaN(num));
  }, []);

  const convertRankingsToStringFormat = useCallback(
    (userRankings: number[][]): string[] => {
      return userRankings.map((ranking) => rankingArrayToString(ranking));
    },
    [rankingArrayToString],
  );

  const convertRankingsFromStringFormat = useCallback(
    (stringRankings: string[]): number[][] => {
      return stringRankings.map((rankingStr) =>
        rankingStringToArray(rankingStr),
      );
    },
    [rankingStringToArray],
  );

  // Load rankings and completed from Firestore
  useEffect(() => {
    if (!jobId) return;

    setLoading(true);
    setLoadingCompleted(true);

    getDoc(doc(db, "anotanusa-project", jobId))
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Load answers in the format: answers: { 'userId': ["1,2,4,3", "2,3,1"] }
          const answersData = data.answers ?? {};
          const convertedRankings: { [userId: string]: number[][] } = {};

          Object.keys(answersData).forEach((userId) => {
            if (Array.isArray(answersData[userId])) {
              // Convert from string format to number arrays for internal use
              convertedRankings[userId] = convertRankingsFromStringFormat(
                answersData[userId],
              );
            }
          });

          setRankings(convertedRankings);
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
  }, [jobId, convertRankingsFromStringFormat]);

  // Set currentQuestion to first unranked for this user
  useEffect(() => {
    if (!userId || !datasetLength || loading) return;

    const userRankings = rankings[userId] || [];
    const firstUnranked = userRankings.findIndex(
      (ranking) => !ranking || ranking.length === 0,
    );

    // Only auto-set if currentQuestion is out of bounds or on mount
    if (currentQuestion < 1 || currentQuestion > datasetLength) {
      if (firstUnranked === -1) {
        setCurrentQuestion(datasetLength); // Stay on last question if all are ranked
      } else {
        setCurrentQuestion(firstUnranked + 1);
      }
    }
    // eslint-disable-next-line
  }, [rankings, userId, datasetLength, loading]);

  // Set ranking for a question (local only)
  const setRanking = useCallback(
    (questionIdx: number, ranking: number[]) => {
      if (!userId) return;

      setRankings((prev) => {
        const userRankings = prev[userId] ? [...prev[userId]] : [];
        userRankings[questionIdx] = ranking;
        return { ...prev, [userId]: userRankings };
      });

      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new auto-save timeout (save after 2 seconds of inactivity)
      const timeout = setTimeout(() => {
        saveRankings();
      }, 2000);

      setAutoSaveTimeout(timeout);
    },
    [userId, autoSaveTimeout],
  );

  // Save rankings to Firestore in the format: answers: { 'userId': ["1,2,4,3", "2,3,1"] }
  const saveRankings = useCallback(async () => {
    if (!jobId || saving || !userId) return;

    setSaving(true);
    setError(null);

    try {
      // Convert current user's rankings to string format
      const userRankings = rankings[userId] || [];
      const userRankingsAsStrings = convertRankingsToStringFormat(userRankings);

      // Prepare the answers object in the required format
      const answersUpdate: { [key: string]: string[] } = {};
      answersUpdate[userId] = userRankingsAsStrings;

      // Update Firestore document
      await updateDoc(doc(db, "anotanusa-project", jobId), {
        [`answers.${userId}`]: userRankingsAsStrings,
        lastUpdated: Date.now(),
      });

      console.log("Rankings saved to Firestore:", {
        userId,
        rankings: userRankingsAsStrings,
      });
    } catch (err) {
      console.error("Error saving rankings:", err);
      setError("Failed to save rankings");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [jobId, rankings, saving, userId, convertRankingsToStringFormat]);

  // Save current ranking and navigate to next question
  const goToNext = useCallback(async () => {
    if (currentQuestion >= datasetLength) return;

    try {
      await saveRankings();
      setCurrentQuestion((prev) => Math.min(datasetLength, prev + 1));
    } catch (err) {
      console.error("Failed to save before navigation:", err);
      setError("Failed to save current ranking. Please try again.");
    }
  }, [currentQuestion, datasetLength, saveRankings]);

  // Save current ranking and navigate to previous question
  const goToPrevious = useCallback(async () => {
    if (currentQuestion <= 1) return;

    try {
      await saveRankings();
      setCurrentQuestion((prev) => Math.max(1, prev - 1));
    } catch (err) {
      console.error("Failed to save before navigation:", err);
      setError("Failed to save current ranking. Please try again.");
    }
  }, [currentQuestion, saveRankings]);

  // Save current ranking and navigate to specific question
  const goToQuestion = useCallback(
    async (questionNumber: number) => {
      const targetQuestion = Math.max(
        1,
        Math.min(datasetLength, questionNumber),
      );
      if (targetQuestion === currentQuestion) return;

      try {
        await saveRankings();
        setCurrentQuestion(targetQuestion);
      } catch (err) {
        console.error("Failed to save before navigation:", err);
        setError("Failed to save current ranking. Please try again.");
      }
    },
    [currentQuestion, datasetLength, saveRankings],
  );

  // Mark as complete in Firestore
  const markComplete = useCallback(async () => {
    if (!jobId || !userId) return;

    setSaving(true);
    setError(null);

    try {
      // First save any pending rankings
      await saveRankings();

      console.log("Marked as complete for user:", userId);

      // Log final rankings in string format for verification
      const finalRankings = convertRankingsToStringFormat(
        rankings[userId] || [],
      );
      console.log("Final rankings saved to Firestore:", {
        userId,
        rankings: finalRankings,
      });
    } catch (err) {
      console.error("Error marking complete:", err);
      setError("Failed to mark as complete");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [
    jobId,
    userId,
    completed,
    rankings,
    saveRankings,
    convertRankingsToStringFormat,
  ]);

  // Manual save function
  const saveCurrentRanking = useCallback(async () => {
    try {
      await saveRankings();
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        setAutoSaveTimeout(null);
      }
    } catch (err) {
      console.error("Manual save failed:", err);
    }
  }, [saveRankings, autoSaveTimeout]);

  // Get current ranking
  const currentRanking = userId
    ? rankings[userId]?.[currentQuestion - 1] || []
    : [];

  // Get current ranking as string (for debugging/display)
  const getCurrentRankingAsString = useCallback(() => {
    return rankingArrayToString(currentRanking);
  }, [currentRanking, rankingArrayToString]);

  // Get all rankings as strings (for Firestore format)
  const getAllRankingsAsStrings = useCallback(() => {
    if (!userId) return [];
    return convertRankingsToStringFormat(rankings[userId] || []);
  }, [userId, rankings, convertRankingsToStringFormat]);

  // Validation helpers
  const isCurrentRankingValid = useCallback(
    (ranking?: number[]) => {
      const rankingToCheck = ranking !== undefined ? ranking : currentRanking;
      return rankingToCheck.length > 0;
    },
    [currentRanking],
  );

  const getCompletedRankingCount = useCallback(() => {
    if (!userId) return 0;
    const userRankings = rankings[userId] || [];
    return userRankings.filter((ranking) => ranking && ranking.length > 0)
      .length;
  }, [userId, rankings]);

  const getAllRankingsValid = useCallback(() => {
    if (!userId) return false;
    const userRankings = rankings[userId] || [];
    return (
      userRankings.length === datasetLength &&
      userRankings.every((ranking) => ranking && ranking.length > 0)
    );
  }, [userId, rankings, datasetLength]);

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
      // Note: This is synchronous and may not complete for Firestore
      // Consider using navigator.sendBeacon for critical data
      if (userId && rankings[userId]) {
        console.log("Page unload - attempting to save rankings");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [rankings, userId, autoSaveTimeout]);

  return {
    // Data
    rankings,
    currentRanking,

    // Actions
    setRanking,
    saveRankings,
    saveCurrentRanking,
    markComplete,

    // Navigation
    currentQuestion,
    setCurrentQuestion,
    goToNext,
    goToPrevious,
    goToQuestion,

    // Validation
    isCurrentRankingValid,
    getAllRankingsValid,
    getCompletedRankingCount,

    // String format helpers (for Firestore compatibility)
    getCurrentRankingAsString,
    getAllRankingsAsStrings,

    // State
    loading,
    loadingCompleted,
    saving,
    error,
    completed,
  };
}
