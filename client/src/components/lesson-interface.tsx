import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lesson, Subject } from "@shared/schema";

interface LessonInterfaceProps {
  lesson: Lesson;
  subject: Subject | null;
  isVoiceEnabled: boolean;
}

interface LessonContent {
  title: string;
  description: string;
  content: string;
  examples: Array<{
    problem: string;
    solution: string;
    explanation: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

export default function LessonInterface({ lesson, subject, isVoiceEnabled }: LessonInterfaceProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { speak, cancel } = useSpeechSynthesis();

  const { data: lessonContent, isLoading } = useQuery<LessonContent>({
    queryKey: ["/api/lessons", lesson.id, "content"],
    queryFn: async () => {
      if (lesson.content) {
        try {
          return JSON.parse(lesson.content);
        } catch {
          // If content is not JSON, generate new content
        }
      }
      
      // Generate new content
      const response = await apiRequest("POST", `/api/lessons/${lesson.id}/generate`);
      return await response.json();
    },
  });

  const completeLesson = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/users/1/progress", {
        subjectId: lesson.subjectId,
        lessonId: lesson.id,
        completed: true,
        progress: 100,
      });
    },
    onSuccess: () => {
      toast({
        title: "Lesson Completed!",
        description: "Great job! You've successfully completed this lesson.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/progress"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuizAnswer = (answerIndex: number) => {
    if (showQuizResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowQuizResult(true);
    
    const quiz = lessonContent?.quiz?.[0];
    if (quiz) {
      const isCorrect = answerIndex === quiz.correctAnswer;
      const message = isCorrect 
        ? `Correct! ${quiz.explanation}`
        : `Not quite right. ${quiz.explanation}`;
      
      if (isVoiceEnabled) {
        speak(message);
      }
    }
  };

  const handleSpeakContent = () => {
    if (!lessonContent || !isVoiceEnabled) return;
    
    cancel(); // Cancel any ongoing speech
    speak(lessonContent.content);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edu-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lessonContent) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-600">Failed to load lesson content. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const quiz = lessonContent.quiz?.[0];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-dark-text">
              {lessonContent.title}
            </h3>
            <p className="text-gray-600">
              {lessonContent.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Lesson Progress</span>
            <Progress value={25} className="w-20" />
          </div>
        </div>

        {/* Lesson Content */}
        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-dark-text">Lesson Content</h4>
              {isVoiceEnabled && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSpeakContent}
                >
                  🔊 Listen
                </Button>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {lessonContent.content}
            </p>
            
            {/* Examples */}
            {lessonContent.examples?.map((example, index) => (
              <div key={index} className="mt-4 p-4 bg-white border-2 border-blue-100 rounded-lg">
                <h5 className="font-medium text-edu-blue mb-2">
                  Example {index + 1}: {example.problem}
                </h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Solution:</strong> {example.solution}</p>
                  <p><strong>Explanation:</strong> {example.explanation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Quiz */}
          {quiz && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
              <h4 className="font-semibold text-dark-text mb-3 flex items-center">
                <CheckCircle className="text-warm-orange mr-2 w-5 h-5" />
                Quick Check
              </h4>
              <p className="mb-4 text-gray-700">
                {quiz.question}
              </p>
              
              <div className="space-y-2">
                {quiz.options.map((option, index) => (
                  <label 
                    key={index}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      showQuizResult
                        ? index === quiz.correctAnswer
                          ? "border-success-green bg-green-50"
                          : index === selectedAnswer && index !== quiz.correctAnswer
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white"
                        : selectedAnswer === index
                        ? "border-edu-blue bg-blue-50"
                        : "border-gray-200 bg-white hover:border-edu-blue hover:bg-blue-50"
                    }`}
                    onClick={() => handleQuizAnswer(index)}
                  >
                    <input 
                      type="radio" 
                      name="quiz" 
                      className="mr-3"
                      checked={selectedAnswer === index}
                      readOnly
                    />
                    <span>{option}</span>
                    {showQuizResult && index === quiz.correctAnswer && (
                      <Badge className="ml-auto bg-success-green">Correct</Badge>
                    )}
                  </label>
                ))}
              </div>
              
              {showQuizResult && (
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-700">
                    <strong>Explanation:</strong> {quiz.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lesson Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button variant="outline" disabled>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Lesson
          </Button>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Bookmark className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
            <Button 
              className="bg-success-green hover:bg-green-600 text-white"
              onClick={() => completeLesson.mutate()}
              disabled={completeLesson.isPending}
            >
              {completeLesson.isPending ? "Saving..." : "Complete Lesson"}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <Button variant="outline" disabled>
            Next Lesson
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
