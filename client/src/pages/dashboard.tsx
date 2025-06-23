import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, GraduationCap, Bell } from "lucide-react";
import AvatarDisplay from "@/components/avatar-display";
import SubjectCard from "@/components/subject-card";
import LessonInterface from "@/components/lesson-interface";
import ChatInterface from "@/components/chat-interface";
import ProgressTracker from "@/components/progress-tracker";
import type { Subject, Lesson } from "@shared/schema";

export default function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const queryClient = useQueryClient();

  const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/subjects", selectedSubject?.id, "lessons"],
    enabled: !!selectedSubject,
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      if (!selectedSubject) return [];
      const response = await fetch(`/api/subjects/${selectedSubject.id}/lessons`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      return response.json();
    },
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users/1/progress"], // Using default user ID
  });

  const handleSubjectSelect = (subject: Subject) => {
    // Clear all lesson-related queries when switching subjects
    queryClient.invalidateQueries({ 
      queryKey: ["/api/subjects"],
      refetchType: "all" 
    });
    
    setSelectedSubject(subject);
    setSelectedLesson(null);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  if (subjectsLoading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edu-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-edu-blue rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white text-xl" />
                </div>
                <h1 className="text-2xl font-bold text-edu-blue">AI Tutor</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-dark-text hover:text-edu-blue transition-colors font-medium">Dashboard</a>
              <a href="#" className="text-dark-text hover:text-edu-blue transition-colors font-medium">Subjects</a>
              <a href="#" className="text-dark-text hover:text-edu-blue transition-colors font-medium">Progress</a>
              <a href="#" className="text-dark-text hover:text-edu-blue transition-colors font-medium">History</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="w-8 h-8 bg-edu-blue rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">JS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Subject Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-dark-text">Choose Your Subject</h2>
                
                <div className="space-y-3">
                  {subjects?.map((subject) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      isSelected={selectedSubject?.id === subject.id}
                      onSelect={() => handleSubjectSelect(subject)}
                      progress={75} // TODO: Get from userProgress
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <ProgressTracker userProgress={userProgress} />
          </div>

          {/* Main Content Area - Avatar and Lesson */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Avatar Section */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-avatar-frame to-blue-50 p-8">
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                  
                  <AvatarDisplay 
                    isVoiceEnabled={isVoiceEnabled}
                    currentMessage="Great question! Let me explain quadratic equations step by step..."
                  />

                  {/* Tutor Introduction */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-dark-text mb-2">
                      Meet Alex, Your AI Tutor
                    </h2>
                    <p className="text-gray-600 text-lg mb-4">
                      I'm here to help you master {selectedSubject?.name || "various subjects"} with personalized lessons and interactive explanations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                      <Button 
                        className="bg-edu-blue hover:bg-blue-600 text-white"
                        disabled={!selectedSubject}
                      >
                        <span>Start Learning</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-edu-blue text-edu-blue hover:bg-edu-blue hover:text-white"
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                      >
                        <span>Voice {isVoiceEnabled ? "On" : "Off"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Lessons List */}
            {selectedSubject && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-dark-text">
                    {selectedSubject.name} Lessons
                  </h3>
                  
                  {lessonsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-edu-blue"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lessons?.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className={`lesson-card p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedLesson?.id === lesson.id
                              ? "border-edu-blue bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleLessonSelect(lesson)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-dark-text">{lesson.title}</h4>
                              <p className="text-sm text-gray-600">{lesson.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Lesson {index + 1}</span>
                              <Badge variant="secondary">
                                {index === 0 ? "Available" : "Locked"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Current Lesson Content */}
            {selectedLesson && (
              <LessonInterface 
                lesson={selectedLesson}
                subject={selectedSubject}
                isVoiceEnabled={isVoiceEnabled}
              />
            )}

            {/* Q&A Section */}
            {selectedLesson && (
              <ChatInterface 
                lessonId={selectedLesson.id}
                userId={1} // TODO: Get from auth context
                isVoiceEnabled={isVoiceEnabled}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
