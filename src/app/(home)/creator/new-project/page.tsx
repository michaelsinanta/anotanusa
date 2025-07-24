"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  FileText,
  Calendar,
  CreditCard,
  Target,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface ProjectForm {
  title: string;
  description: string;
  annotationTask: string;
  dueDate: string;
  credit: number;
  csvFile: File | null;
  labels: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  annotationTask?: string;
  dueDate?: string;
  credit?: string;
  csvFile?: string;
  labels?: string;
}

export default function NewProjectPage() {
  const [form, setForm] = useState<ProjectForm>({
    title: "",
    description: "",
    annotationTask: "",
    dueDate: "",
    credit: 0,
    csvFile: null,
    labels: ["", ""], // Add this line with 2 empty labels by default
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    field: keyof ProjectForm,
    value: string | number | File | null,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleInputChange("csvFile", file);
      } else {
        alert("Please upload a CSV file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleInputChange("csvFile", file);
      } else {
        alert("Please upload a CSV file");
      }
    }
  };

  const addLabel = () => {
    setForm((prev) => ({
      ...prev,
      labels: [...prev.labels, ""],
    }));
  };

  const removeLabel = (index: number) => {
    if (form.labels.length > 2) {
      setForm((prev) => ({
        ...prev,
        labels: prev.labels.filter((_, i) => i !== index),
      }));
    }
  };

  const updateLabel = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.map((label, i) => (i === index ? value : label)),
    }));

    // Clear label errors when user starts typing
    if (errors.labels) {
      setErrors((prev) => ({ ...prev, labels: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.annotationTask)
      newErrors.annotationTask = "Annotation task is required";
    if (!form.dueDate) newErrors.dueDate = "Due date is required";
    if (form.credit <= 0) newErrors.credit = "Credit must be greater than 0";
    if (!form.csvFile) newErrors.csvFile = "Dataset file is required";

    // Add label validation for text-classification
    if (form.annotationTask === "text-classification") {
      const validLabels = form.labels.filter((label) => label.trim() !== "");
      if (validLabels.length < 2) {
        newErrors.labels =
          "At least 2 labels are required for text classification";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would typically send the data to your API
      console.log("Project created:", form);

      // Reset form or redirect
      alert("Project created successfully!");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Create New Project
          </h1>
          <p className="text-gray-600">
            Set up your annotation project with dataset and requirements
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Project Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Indo to Java Translation"
                      value={form.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project goals and requirements..."
                      value={form.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="annotationTask">Annotation Task *</Label>
                    <Select
                      value={form.annotationTask}
                      onValueChange={(value) =>
                        handleInputChange("annotationTask", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.annotationTask ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select annotation task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-to-text">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Text-to-Text
                          </div>
                        </SelectItem>
                        <SelectItem value="text-classification">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Text Classification
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.annotationTask && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.annotationTask}
                      </p>
                    )}
                  </div>
                  {form.annotationTask === "text-classification" && (
                    <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-base font-medium">
                          <Target className="h-4 w-4" />
                          Target Labels *
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addLabel}
                          className="border-blue-300 bg-transparent text-blue-600 hover:bg-blue-100"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Label
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {form.labels.map((label, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder={`Label ${index + 1} (e.g., Positive, Negative)`}
                                value={label}
                                onChange={(e) =>
                                  updateLabel(index, e.target.value)
                                }
                                className={
                                  errors.labels
                                    ? "border-red-500"
                                    : "border-blue-200 focus:border-blue-500"
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLabel(index)}
                              disabled={form.labels.length <= 2}
                              className="text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {errors.labels && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {errors.labels}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-blue-600">
                        Add at least 2 classification labels. These will be used
                        by annotators to categorize your text data.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dataset Upload Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Dataset Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : errors.csvFile
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {form.csvFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {form.csvFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(form.csvFile.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange("csvFile", null)}
                        >
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Upload your dataset
                          </p>
                          <p className="text-gray-500">
                            Drag and drop your CSV file here, or click to browse
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                          id="csvUpload"
                        />
                        <Button type="button" variant="outline" asChild>
                          <label htmlFor="csvUpload" className="cursor-pointer">
                            Choose File
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.csvFile && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {errors.csvFile}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Project Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        handleInputChange("dueDate", e.target.value)
                      }
                      className={errors.dueDate ? "border-red-500" : ""}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.dueDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="credit">Credit Reward *</Label>
                    <div className="relative">
                      <CreditCard className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="credit"
                        type="number"
                        placeholder="0"
                        value={form.credit || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "credit",
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        className={`pl-10 ${errors.credit ? "border-red-500" : ""}`}
                        min="1"
                      />
                    </div>
                    {errors.credit && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.credit}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Credits will be distributed to annotators
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Project Summary Card */}
              {form.annotationTask && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Project Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Task Type:</span>
                      <Badge variant="secondary">
                        {form.annotationTask === "text-to-text"
                          ? "Text-to-Text"
                          : "Text Classification"}
                      </Badge>
                    </div>
                    {form.dueDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">
                          {new Date(form.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {form.credit > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Credits:</span>
                        <span className="font-medium text-green-600">
                          {form.credit}
                        </span>
                      </div>
                    )}
                    {form.csvFile && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Dataset:</span>
                        <span className="font-medium">
                          {formatFileSize(form.csvFile.size)}
                        </span>
                      </div>
                    )}
                    {form.annotationTask === "text-classification" &&
                      form.labels.some((label) => label.trim()) && (
                        <div className="space-y-1">
                          <span className="text-sm text-gray-600">Labels:</span>
                          <div className="flex flex-wrap gap-1">
                            {form.labels
                              .filter((label) => label.trim())
                              .map((label, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {label}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <Button type="button" variant="outline" asChild>
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
