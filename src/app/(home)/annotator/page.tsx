import { JobList } from "@/components/annotator/job-list";

export default function AnnotatorJobsPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full">
        <h1 className="mb-2 text-3xl font-bold">Find Annotation Jobs</h1>
        <p className="mb-6 text-muted-foreground">
          Browse and join jobs created by dataset creators. Help build
          high-quality, culturally aware NLP datasets for Indonesia’s languages.
        </p>
        <JobList />
      </div>
    </div>
  );
}
