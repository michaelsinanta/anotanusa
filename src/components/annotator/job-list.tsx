"use client";

import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import JobCard from "./job-card";
import JobFilters from "./job-filter";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client/clientApp";
import { Job } from "@/types/job";

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

  // Filtering logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        search === "" ||
        job.name.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "" || job.type === type;
      return matchesSearch && matchesType;
    });
  }, [jobs, search, type]);

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
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
