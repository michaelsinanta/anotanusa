"use client";
import { Button } from "@/components/ui/button";
import type { TaskData } from "@/lib/types/project";
import { Download } from "lucide-react";

export function DownloadClassificationTask({
  taskData,
}: {
  taskData: TaskData;
}) {
  const handleDownload = (format: "csv" | "json") => {
    const exportData = taskData.dataset.map((item, itemIndex) => {
      const itemAnswers: string[] = [];
      Object.entries(taskData.answers as Record<string, string[]>).forEach(
        ([_, userAnswers]) => {
          if (userAnswers[itemIndex]) {
            itemAnswers.push(userAnswers[itemIndex]);
          }
        },
      );

      const itemCounts: Record<string, number> = {};
      itemAnswers.forEach((answer) => {
        itemCounts[answer] = (itemCounts[answer] || 0) + 1;
      });

      const mostCommonAnswer = Object.entries(itemCounts).sort(
        ([, a], [, b]) => b - a,
      )[0];

      return {
        input: item.text,
        mostCommonResult: mostCommonAnswer ? mostCommonAnswer[0] : null,
        totalRespondents: itemAnswers.length,
        distribution: itemCounts,
      };
    });

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "csv") {
      const headers = [
        "Input",
        "Majority Result",
        "Total Respondents",
        "Distribution",
      ];
      const csvRows = [headers.join(",")];

      exportData.forEach((item) => {
        const distributionStr = Object.entries(item.distribution)
          .map(([choice, count]) => `${choice}:${count}`)
          .join(";");

        const row = [
          `"${item.input.replace(/"/g, '""')}"`,
          item.mostCommonResult || "N/A",
          item.totalRespondents,
          `"${distributionStr}"`,
        ];
        csvRows.push(row.join(","));
      });

      content = csvRows.join("\n");
      filename = `task-${taskData.title.replace(/[^a-z0-9]/gi, "_")}-results.csv`;
      mimeType = "text/csv";
    } else {
      content = JSON.stringify(exportData, null, 2);
      filename = `task-${taskData.title.replace(/[^a-z0-9]/gi, "_")}-results.json`;
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDownload("csv")}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDownload("json")}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        JSON
      </Button>
    </div>
  );
}

export function DownloadRankedTaskData({ taskData }: { taskData: TaskData }) {
  const downloadCSV = () => {
    const userRankings =
      taskData.answers && Array.isArray(taskData.answers) && taskData.answers[0]
        ? (taskData.answers[0] as Record<string, string[]>)
        : {};

    // Create CSV content
    const csvRows = [];

    // Header row
    const headers = [
      "Item",
      "Text",
      "Choice",
      "Choice_Text",
      "Total_Rank",
      "Average_Rank",
      "Vote_Count",
      "Best_Choice",
    ];
    csvRows.push(headers.join(","));

    // Data rows
    taskData.dataset.forEach((item, itemIndex) => {
      // Get all rankings for this item
      const itemRankings: number[][] = [];
      Object.values(userRankings).forEach((userItemRankings) => {
        if (Array.isArray(userItemRankings) && userItemRankings[itemIndex]) {
          const rankingString = userItemRankings[itemIndex];
          if (typeof rankingString === "string") {
            const ranking = rankingString
              .split(",")
              .map((str) => Number.parseInt(str.trim(), 10))
              .filter((num) => !isNaN(num));
            if (ranking.length > 0) {
              itemRankings.push(ranking);
            }
          }
        }
      });

      // Calculate stats for each choice
      const choiceStats: Array<{
        choiceIndex: number;
        totalRank: number;
        avgRank: number;
        count: number;
      }> = [];

      if (itemRankings.length > 0) {
        const maxChoices = Math.max(
          ...itemRankings.map((ranking) => ranking.length),
        );

        for (let choiceIndex = 0; choiceIndex < maxChoices; choiceIndex++) {
          let totalRank = 0;
          let count = 0;

          itemRankings.forEach((ranking) => {
            if (ranking[choiceIndex] !== undefined) {
              totalRank += ranking[choiceIndex];
              count++;
            }
          });

          if (count > 0) {
            choiceStats.push({
              choiceIndex,
              totalRank,
              avgRank: totalRank / count,
              count,
            });
          }
        }
      }

      choiceStats.sort((a, b) => a.totalRank - b.totalRank);
      const bestChoiceIndex = choiceStats[0]?.choiceIndex;

      // Add row for each choice
      choiceStats.forEach((choice) => {
        const row = [
          itemIndex + 1,
          `"${item.text.replace(/"/g, '""')}"`, // Escape quotes in text
          choice.choiceIndex + 1,
          item.choices && item.choices[choice.choiceIndex]
            ? `"${item.choices[choice.choiceIndex].replace(/"/g, '""')}"`
            : `Choice ${choice.choiceIndex + 1}`,
          choice.totalRank,
          choice.avgRank.toFixed(2),
          choice.count,
          choice.choiceIndex === bestChoiceIndex ? "YES" : "NO",
        ];
        csvRows.push(row.join(","));
      });
    });

    // Download CSV
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${taskData.title}_rankings.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    const userRankings =
      taskData.answers && Array.isArray(taskData.answers) && taskData.answers[0]
        ? (taskData.answers[0] as Record<string, string[]>)
        : {};

    const jsonData = {
      task: {
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
        totalAnnotators: taskData.totalAnnotators,
        endDate: taskData.endDate,
      },
      items: taskData.dataset.map((item, itemIndex) => {
        // Get all rankings for this item
        const itemRankings: number[][] = [];
        const userRankingDetails: Record<string, number[]> = {};

        Object.entries(userRankings).forEach(([userId, userItemRankings]) => {
          if (Array.isArray(userItemRankings) && userItemRankings[itemIndex]) {
            const rankingString = userItemRankings[itemIndex];
            if (typeof rankingString === "string") {
              const ranking = rankingString
                .split(",")
                .map((str) => Number.parseInt(str.trim(), 10))
                .filter((num) => !isNaN(num));
              if (ranking.length > 0) {
                itemRankings.push(ranking);
                userRankingDetails[userId] = ranking;
              }
            }
          }
        });

        // Calculate stats for each choice
        const choiceStats: Array<{
          choiceIndex: number;
          choiceText: string;
          totalRank: number;
          avgRank: number;
          count: number;
        }> = [];

        if (itemRankings.length > 0) {
          const maxChoices = Math.max(
            ...itemRankings.map((ranking) => ranking.length),
          );

          for (let choiceIndex = 0; choiceIndex < maxChoices; choiceIndex++) {
            let totalRank = 0;
            let count = 0;

            itemRankings.forEach((ranking) => {
              if (ranking[choiceIndex] !== undefined) {
                totalRank += ranking[choiceIndex];
                count++;
              }
            });

            if (count > 0) {
              choiceStats.push({
                choiceIndex,
                choiceText:
                  item.choices && item.choices[choiceIndex]
                    ? item.choices[choiceIndex]
                    : `Choice ${choiceIndex + 1}`,
                totalRank,
                avgRank: totalRank / count,
                count,
              });
            }
          }
        }

        choiceStats.sort((a, b) => a.totalRank - b.totalRank);

        return {
          itemIndex: itemIndex + 1,
          text: item.text,
          choices: item.choices || [],
          userRankings: userRankingDetails,
          choiceStatistics: choiceStats,
          bestChoice: choiceStats[0] || null,
          totalResponses: itemRankings.length,
        };
      }),
      summary: {
        totalItems: taskData.dataset.length,
        totalUsers: Object.keys(userRankings).length,
        totalRankings: Object.values(userRankings).reduce(
          (sum, userItems) =>
            sum + (Array.isArray(userItems) ? userItems.length : 0),
          0,
        ),
      },
    };

    // Download JSON
    const jsonContent = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${taskData.title}_rankings.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={downloadCSV}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadJSON}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        JSON
      </Button>
    </div>
  );
}
