"use client";
import { Button } from "@/components/ui/button";
import type { TaskData } from "@/lib/types/project";
import { Download } from "lucide-react";

export function DownloadButton({ taskData }: { taskData: TaskData }) {
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
