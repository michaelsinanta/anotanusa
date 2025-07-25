"use client";
import { useEffect, useState, useMemo } from "react";
import { Job } from "@/types/job";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client/clientApp";
import JobCard from "@/components/annotator/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/firebase/useUser";

export default function YourAnnotationsPage() {
  const user = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const projectsCol = collection(db, "anotanusa-project");
        const projectsSnapshot = await getDocs(projectsCol);
        const projects = projectsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const answersObj = data.answers ?? {};
          return {
            id: doc.id,
            name: data.title ?? "Untitled",
            type: data.type ?? "text-classification",
            description: data.description ?? "",
            creator: data.creatorId ?? "",
            totalCredits: data.totalCredits ?? 0,
            endDate: data.endDate ? data.endDate : Timestamp.now(),
            totalAnnotators: data.totalAnnotators ?? 0,
            answers: new Map(Object.entries(answersObj)),
            dataset: data.dataset ?? [],
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

  // Filter jobs to only those where the user has annotated (answers contains user.uid)
  const filteredJobs = useMemo(() => {
    if (!user) return [];
    return jobs.filter((job) => job.answers && job.answers.has(user.uid));
  }, [jobs, user]);

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
    <div className="flex w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full">
        <h1 className="mb-2 text-3xl font-bold">Your Annotations</h1>
        <p className="mb-6 text-muted-foreground">
          View your past and in-progress annotation jobs.
        </p>
        {filteredJobs.length === 0 ? (
          <div className="text-center text-muted-foreground">
            You have not annotated any jobs yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
