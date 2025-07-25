"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  Users,
  Database,
  Zap,
  Target,
  Award,
  ArrowRight,
  ThumbsUp,
  User,
} from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [currentTask, setCurrentTask] = useState(0);
  const [annotationProgress, setAnnotationProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const annotationTasks = [
    {
      type: "Text Classification",
      language: "Javanese",
      text: "Aku seneng banget karo film iki, ceritane apik tenan!",
      translation: "I really love this movie, the story is really good!",
      task: "Classify the sentiment of this Javanese text",
      options: ["Positive", "Negative", "Neutral"],
      annotators: [
        { name: "Sari", location: "Yogyakarta", choice: "Positive" },
        { name: "Budi", location: "Surabaya", choice: "Positive" },
      ],
    },
    {
      type: "Translation",
      language: "Sundanese",
      text: "Kumaha damang?",
      translation: "How are you?",
      task: "Translate this Sundanese greeting to Indonesian",
      options: ["Apa kabar?", "Selamat pagi", "Terima kasih", "Sampai jumpa"],
      annotators: [
        { name: "Rina", location: "Bandung", choice: "Apa kabar?" },
        { name: "Joko", location: "Bogor", choice: "Apa kabar?" },
      ],
    },
    {
      type: "Sequence Labeling",
      language: "Code-Mixed",
      text: "Aku mau pergi ke mall dulu ya",
      translation: "I want to go to the mall first",
      task: "Label language switches in this Indonesian-English mixed text",
      options: ["Indonesian", "English", "Mixed"],
      annotators: [
        { name: "Lisa", location: "Jakarta", choice: "Mixed" },
        { name: "Rudi", location: "Bekasi", choice: "Mixed" },
      ],
    },
    {
      type: "Emotion Recognition",
      language: "Batak",
      text: "Horas! Gabe do ho mangalehen au",
      translation: "Hello! You really make me happy",
      task: "Identify the emotion expressed in this Batak text",
      options: ["Happy", "Sad", "Angry", "Surprised"],
      annotators: [
        { name: "Robert", location: "Medan", choice: "Happy" },
        { name: "Ruth", location: "Tarutung" },
      ],
    },
    {
      type: "Translation",
      language: "Minangkabau",
      text: "Baa kaba? Lamo indak bajumpo",
      translation: "How are you? Long time no see",
      task: "Translate this Minangkabau phrase to Indonesian",
      options: [
        "Apa kabar? Lama tidak bertemu",
        "Selamat datang",
        "Terima kasih banyak",
        "Sampai bertemu lagi",
      ],
      annotators: [
        {
          name: "Fitri",
          location: "Padang",
          choice: "Apa kabar? Lama tidak bertemu",
        },
        {
          name: "Yusuf",
          location: "Bukittinggi",
          choice: "Apa kabar? Lama tidak bertemu",
        },
      ],
    },
    {
      type: "Text Classification",
      language: "Balinese",
      text: "Suksma mewali, makejang sane sampun nunas",
      translation: "Thank you very much, everyone who has helped",
      task: "Classify the sentiment of this Balinese text",
      options: ["Grateful", "Disappointed", "Neutral", "Excited"],
      annotators: [
        { name: "Kadek", location: "Denpasar", choice: "Grateful" },
        { name: "Wayan", location: "Ubud", choice: "Grateful" },
        { name: "Made", location: "Singaraja", choice: "Grateful" },
      ],
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "hero",
        "problem",
        "solution",
        "features",
        "success-stories",
        "technology",
        "impact",
        "cta",
      ];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (annotationProgress < 100) {
        setAnnotationProgress((prev) => Math.min(prev + 50, 100));
      } else {
        setShowResults(true);
        setTimeout(() => {
          setCurrentTask((prev) => (prev + 1) % annotationTasks.length);
          setAnnotationProgress(0);
          setShowResults(false);
        }, 3000);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [annotationProgress, annotationTasks.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const currentTaskData = annotationTasks[currentTask];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        id="hero"
        className="bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 pt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-2xl leading-tight font-bold text-gray-900 lg:text-5xl">
                  Preserving Indonesia&apos;s
                  <span className="block text-green-600">700+ Languages</span>
                </h1>
                <p className="text-lg leading-relaxed text-gray-600">
                  AnotaNusa is a collaborative platform that mobilizes
                  Indonesia&apos;s speakers to create high-quality, culturally
                  authentic NLP datasets for all local languages.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("solution")}
                  className="bg-green-600 px-8 py-3 text-lg hover:bg-green-700"
                >
                  Explore Platform
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("problem")}
                  className="border-green-600 px-8 py-3 text-lg text-green-600 hover:bg-green-50"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Annotation Simulation */}
            <div className="relative text-sm">
              <div className="rounded-2xl bg-white p-8 text-sm shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    Live Annotation Demo
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Collaborative effort</span>
                  </div>
                </div>

                {/* Task Header */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-teal-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-800">
                      {currentTaskData.type}
                    </span>
                    <span className="text-sm text-green-600">
                      {currentTaskData.language}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-gray-700">
                    {currentTaskData.task}
                  </p>
                </div>

                {/* Text to Annotate */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-lg font-medium text-gray-800">
                    {currentTaskData.text}
                  </p>
                  <p className="text-xs text-gray-600 italic">
                    &quot;{currentTaskData.translation}&quot;
                  </p>
                </div>

                {/* Annotators Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      Contributors
                    </h4>
                    <span className="text-sm text-gray-600">
                      {annotationProgress}% complete
                    </span>
                  </div>

                  {currentTaskData.annotators.map((annotator, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between rounded-lg p-3 transition-all ${
                        annotationProgress > index * 25
                          ? "border border-green-200 bg-green-50"
                          : "border border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            annotationProgress > index * 25
                              ? "bg-green-100"
                              : "bg-gray-200"
                          }`}
                        >
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {annotator.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {annotator.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {annotationProgress > index * 50 ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-700">
                              {annotator.choice}
                            </span>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-500"></div>
                            <span className="text-xs text-gray-500">
                              Working...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm text-gray-600">
                    <span>Annotation Progress</span>
                    <span>{annotationProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-600 transition-all duration-500"
                      style={{ width: `${annotationProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              The Crisis We Face
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Indonesia&apos;s rich linguistic heritage is disappearing from the
              digital world, creating a critical gap in AI and technology
              development.
            </p>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-3">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <div className="mb-4 text-4xl">⚠️</div>
                <h3 className="mb-3 text-xl font-bold text-red-800">
                  Digital Extinction
                </h3>
                <p className="text-red-700">
                  Most of Indonesia&apos;s 700+ local languages have zero
                  digital presence, risking permanent loss in the digital age.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-8 text-center">
                <Database className="mx-auto mb-4 h-12 w-12 text-orange-600" />
                <h3 className="mb-3 text-xl font-bold text-orange-800">
                  Data Scarcity
                </h3>
                <p className="text-orange-700">
                  Even major languages like Javanese have extremely limited
                  labeled datasets, making AI development nearly impossible.
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-8 text-center">
                <Globe className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
                <h3 className="mb-3 text-xl font-bold text-yellow-800">
                  Cultural Disconnect
                </h3>
                <p className="text-yellow-700">
                  Current AI systems lack cultural nuance and local context,
                  failing to serve Indonesia&apos;s diverse communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section
        id="solution"
        className="bg-gradient-to-br from-green-50 to-teal-50 py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Our Solution
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              AnotaNusa creates a collaborative ecosystem where Indonesia&apos;s
              linguistic diversity becomes its greatest strength in building AI
              for everyone.
            </p>
          </div>

          <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-gray-800">
                      Community-Driven Annotation
                    </h3>
                    <p className="text-gray-600">
                      Native speakers contribute their linguistic expertise
                      while earning fair compensation for their valuable work.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
                    <Database className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-gray-800">
                      High-Quality Datasets
                    </h3>
                    <p className="text-gray-600">
                      Majority voting and quality control ensure culturally
                      authentic, reliable datasets for AI training.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100">
                    <Zap className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-gray-800">
                      Scalable Platform
                    </h3>
                    <p className="text-gray-600">
                      Researchers can easily create projects and access
                      qualified annotators without logistical burdens.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => scrollToSection("features")}
                className="bg-green-600 hover:bg-green-700"
              >
                Explore Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <h3 className="mb-6 text-center text-xl font-bold text-gray-800">
                How It Works
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      Researchers Create Projects
                    </h4>
                    <p className="text-sm text-gray-600">
                      Define annotation tasks for specific languages and domains
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-600">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      Community Contributes
                    </h4>
                    <p className="text-sm text-gray-600">
                      Native speakers annotate data in their local languages
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-600">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      Dataset Delivery
                    </h4>
                    <p className="text-sm text-gray-600">
                      Researchers receive culturally authentic, labeled datasets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Platform Features
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Comprehensive NLP task support with quality assurance and fair
              compensation for contributors.
            </p>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-3">
            <Card className="border-green-200 transition-shadow hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <Target className="mx-auto mb-6 h-16 w-16 text-green-600" />
                <h3 className="mb-4 text-xl font-bold text-green-800">
                  Text Classification
                </h3>
                <ul className="space-y-1 text-green-700">
                  <li>Sentiment Analysis</li>
                  <li>Emotion Recognition</li>
                  <li>Topic Classification</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 transition-shadow hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <Zap className="mx-auto mb-6 h-16 w-16 text-orange-600" />
                <h3 className="mb-4 text-xl font-bold text-orange-800">
                  Text Generation
                </h3>
                <ul className="space-y-1 text-orange-700">
                  <li>Translation</li>
                  <li>Text Summarization</li>
                  <li>Question Answering</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 transition-shadow hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <Globe className="mx-auto mb-6 h-16 w-16 text-purple-600" />
                <h3 className="mb-4 text-xl font-bold text-purple-800">
                  Text Reranking
                </h3>
                <ul className="space-y-1 text-purple-600">
                  <li>Reranker Training</li>
                  <li>Recommendation System</li>
                  <li>Relevancy Scoring</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-teal-200 bg-teal-50">
            <CardContent className="">
              <div className="flex items-center justify-center">
                <Award className="mr-4 h-12 w-12 text-teal-600" />
                <h3 className="text-2xl font-bold text-teal-800">
                  Direct Reward System for Contributors
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        className="bg-gradient-to-br from-green-600 to-teal-600 py-20"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white lg:text-5xl">
                Join the Movement
              </h2>
              <p className="text-xl leading-relaxed text-green-100">
                Be part of preserving Indonesia&apos;s linguistic heritage.
                Whether you&apos;re a researcher, developer, or native speaker,
                there&apos;s a place for you in our community.
              </p>
            </div>

            <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
              <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-white" />
                  <h3 className="mb-2 text-xl font-bold text-white">
                    For Contributors
                  </h3>
                  <p className="mb-4 text-sm text-green-100">
                    Share your linguistic expertise and earn fair compensation
                  </p>
                  <Button variant="secondary" className="w-full">
                    Start Contributing
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Database className="mx-auto mb-4 h-12 w-12 text-white" />
                  <h3 className="mb-2 text-xl font-bold text-white">
                    For Researchers/Creators
                  </h3>
                  <p className="mb-4 text-sm text-green-100">
                    Collect high-quality datasets for your AI projects
                  </p>
                  <Button variant="secondary" className="w-full">
                    Create Project
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white">
        <div className="text-center">
          <p className="text-sm text-gray-400">© 2025 AnotaNusa.</p>
          <p className="mt-2 text-xs text-gray-500">
            Bhinneka Tunggal Ika - Unity in Diversity
          </p>
        </div>
      </footer>
    </div>
  );
}
