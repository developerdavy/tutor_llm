import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import AvatarDisplay from "@/components/avatar-display";
import SubjectCard from "@/components/subject-card";
import LessonInterface from "@/components/lesson-interface";
import ChatInterface from "@/components/chat-interface";
import ProgressTracker from "@/components/progress-tracker";
import { useAuth } from "@/contexts/AuthContext";
import type { Subject, Lesson } from "@shared/schema";

export default function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/subjects/${selectedSubject?.id}/lessons`, selectedSubject?.id],
    enabled: !!selectedSubject,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    networkMode: "always",
  });

  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  // Handle URL parameters for subject selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const subjectId = urlParams.get('subject');
    
    if (subjectId && subjects && !selectedSubject) {
      const subject = subjects.find(s => s.id === parseInt(subjectId));
      if (subject) {
        handleSubjectSelect(subject);
      }
    }
  }, [location, subjects]);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedLesson(null);
    setSelectedSubject(null); // Clear first to force re-render
    
    // Clear all queries completely
    queryClient.clear();
    
    // Set the new subject after a brief delay to ensure cache is cleared
    setTimeout(() => {
      setSelectedSubject(subject);
    }, 100);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  if (subjectsLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edu-blue"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.fullName || user?.username}!</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={isVoiceEnabled ? "bg-green-50 border-green-200" : ""}
            >
              {isVoiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Subjects */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-dark-text">Select a Subject</h3>
                  <div className="space-y-3">
                    {subjects?.map((subject) => (
                      <SubjectCard
                        key={subject.id}
                        subject={subject}
                        isSelected={selectedSubject?.id === subject.id}
                        onSelect={() => handleSubjectSelect(subject)}
                        progress={0}
                      />
                    ))}
                  </div>
                  
                  {!subjects?.length && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No subjects available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <ProgressTracker userProgress={userProgress as any} />
            </div>

            {/* Main Content Area - Avatar and Lesson */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Avatar */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-text">AI Tutor</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {isVoiceEnabled ? "Voice Enabled" : "Voice Disabled"}
                    </Badge>
                  </div>
                  
                  <AvatarDisplay 
                    isVoiceEnabled={isVoiceEnabled}
                    currentMessage={selectedLesson ? "Ready to help with your lesson!" : "Select a subject to begin learning"}
                  />
                </CardContent>
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
                        <p className="ml-2 text-sm text-gray-600">Loading {selectedSubject?.name} lessons...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500 mb-3">Showing {lessons?.length || 0} lessons for {selectedSubject?.name}</p>
                        {lessons?.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedLesson?.id === lesson.id
                                ? "border-edu-blue bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleLessonSelect(lesson)}
                          >
                            <h4 className="font-medium text-dark-text">{lesson.title}</h4>
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                Lesson {lesson.order}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Subject: {selectedSubject?.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!lessons?.length && !lessonsLoading && (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No lessons available for this subject</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Lesson Interface */}
              {selectedLesson && selectedSubject && (
                <>
                  <Separator />
                  <LessonInterface 
                    lesson={selectedLesson} 
                    subject={selectedSubject}
                    isVoiceEnabled={isVoiceEnabled}
                  />
                </>
              )}

              {/* Chat Interface */}
              {selectedLesson && user && (
                <>
                  <Separator />
                  <ChatInterface 
                    lessonId={selectedLesson.id}
                    userId={user.id}
                    isVoiceEnabled={isVoiceEnabled}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}