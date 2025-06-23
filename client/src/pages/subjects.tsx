import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout";
import type { Subject, UserProgress } from "@shared/schema";

export default function Subjects() {
  const { user } = useAuth();

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const getSubjectProgress = (subjectId: number) => {
    if (!userProgress || !Array.isArray(userProgress)) return 0;
    const subjectProgressData = userProgress.filter((p: any) => p.subjectId === subjectId);
    if (subjectProgressData.length === 0) return 0;
    const completed = subjectProgressData.filter((p: any) => p.completed).length;
    return Math.round((completed / subjectProgressData.length) * 100);
  };

  const getSubjectStats = (subjectId: number) => {
    if (!userProgress || !Array.isArray(userProgress)) return { totalLessons: 0, completedLessons: 0, timeSpent: 0 };
    const subjectProgressData = userProgress.filter((p: any) => p.subjectId === subjectId);
    return {
      totalLessons: subjectProgressData.length,
      completedLessons: subjectProgressData.filter((p: any) => p.completed).length,
      timeSpent: subjectProgressData.reduce((acc: number, p: any) => acc + (p.progress || 0), 0)
    };
  };

  if (!subjects) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p>Loading subjects...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subjects</h1>
            <p className="text-gray-600">Explore all available subjects and track your learning progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects?.map((subject) => {
              const progress = getSubjectProgress(subject.id);
              const stats = getSubjectStats(subject.id);
              
              return (
                <Card key={subject.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                          style={{ backgroundColor: subject.color }}
                        >
                          {subject.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {stats.totalLessons} lessons
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm">
                      {subject.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-xs text-gray-600">Completed</p>
                          <p className="font-medium">{stats.completedLessons}/{stats.totalLessons}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-600">Time Spent</p>
                          <p className="font-medium">{Math.round(stats.timeSpent / 60)}min</p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4" variant={progress > 0 ? "default" : "outline"}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      {progress > 0 ? "Continue Learning" : "Start Learning"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            
            {subjects && subjects.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects available</h3>
                <p className="text-gray-600">Subjects will appear here once they're added to the system.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}