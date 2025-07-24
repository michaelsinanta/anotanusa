"use client";

import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import JobCard from "./job-card";
import JobFilters from "./job-filter";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client/clientApp";

interface Job {
  id: number;
  name: string;
  type: "text-to-text" | "text-classification";
  description: string;
  creator: string;
  totalCredits: number;
  endDate: Date;
  totalParticipants: number;
  answers?: Map<string, string[]>;
}

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add filter/search state
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        // TODO: Fetch jobs data
        const projectsCol = collection(db, "anotanusa-project");
        const projectsSnapshot = await getDocs(projectsCol);
        const projects = projectsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const answersObj = data.answers ?? {};
          return {
            id: doc.id,
            name: data.title ?? "Untitled",
            type: data.annotationTask ?? "text-classification",
            description: data.description ?? "",
            creator: data.creator ?? "",
            totalCredits: data.credit ?? 0,
            endDate: data.dueDate ? new Date(data.dueDate) : new Date(),
            totalParticipants: data.totalAnnotator ?? 0,
            answers: new Map(Object.entries(answersObj)),
          } as unknown as Job;
        });
        setJobs(projects);
      } catch (err) {
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Update mockJobs to match new interface
  const mockJobs: Job[] = [
    {
      id: 1,
      name: "Sentiment Analysis Dataset",
      type: "text-classification",
      description:
        "Classify customer reviews as positive, negative, or neutral",
      creator: "E-commerce Analytics",
      totalCredits: 1500,
      endDate: new Date("2025-02-15"),
      totalParticipants: 8,
      answers: new Map([["user1", ["Positive", "Negative", "Neutral"]]]),
    },
    {
      id: 2,
      name: "Text Summarization Dataset",
      type: "text-to-text",
      description: "Summarize news articles into concise summaries.",
      creator: "News AI",
      totalCredits: 1500,
      endDate: new Date("2025-02-15"),
      totalParticipants: 5,
      answers: new Map([["user1", ["Positive", "Negative", "Neutral"]]]),
    },
  ];

  const jobsToShow = jobs.length === 0 ? mockJobs : jobs;

  // Filtering logic
  const filteredJobs = useMemo(() => {
    return jobsToShow.filter((job) => {
      const matchesSearch =
        search === "" ||
        job.name.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "" || job.type === type;
      return matchesSearch && matchesType;
    });
  }, [jobsToShow, search, type]);

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="w-full">
      <JobFilters
        searchTerm={search}
        onSearchChange={setSearch}
        selectedType={type}
        onTypeChange={setType}
      />
      <div className="mb-6 text-sm text-muted-foreground">
        Showing {filteredJobs.length} of {jobsToShow.length} jobs
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
