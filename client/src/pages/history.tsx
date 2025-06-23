import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Clock, BookOpen, Calendar, RotateCcw, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Subject, Lesson, ChatMessage } from "@shared/schema";

export default function History() {
  const { user } = useAuth();

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  // Get recent activity from user progress
  const getRecentActivity = () => {
    if (!userProgress || !Array.isArray(userProgress)) return [];
    
    return userProgress
      .filter((progress: any) => progress.lastAccessed)
      .sort((a: any, b: any) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, 20);
  };

  const getSubjectName = (subjectId: number) => {
    return subjects?.find(s => s.id === subjectId)?.name || "Unknown Subject";
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const getCompletedLessons = () => {
    if (!userProgress || !Array.isArray(userProgress)) return [];
    
    return userProgress
      .filter((progress: any) => progress.completed)
      .sort((a: any, b: any) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());
  };

  const getStudySessions = () => {
    if (!userProgress || !Array.isArray(userProgress)) return [];
    
    // Group activities by date to create study sessions
    const sessionsByDate = userProgress
      .filter((progress: any) => progress.lastAccessed)
      .reduce((acc: any, progress: any) => {
        const date = new Date(progress.lastAccessed).toDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(progress);
        return acc;
      }, {});

    return Object.entries(sessionsByDate)
      .map(([date, activities]: [string, any]) => ({
        date: new Date(date),
        activities: activities.length,
        subjects: new Set(activities.map((a: any) => a.subjectId)).size,
        duration: activities.length * 15 // Estimate 15 minutes per activity
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  };

  const recentActivity = getRecentActivity();
  const completedLessons = getCompletedLessons();
  const studySessions = getStudySessions();

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning History</h1>
          <p className="text-gray-600">Review your learning journey and track your progress over time</p>
        </div>

        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="completed">Completed Lessons</TabsTrigger>
            <TabsTrigger value="sessions">Study Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest learning activities and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity: any, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-edu-blue/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-edu-blue" />
                          </div>
                          <div>
                            <p className="font-medium">{getSubjectName(activity.subjectId)}</p>
                            <p className="text-sm text-gray-600">
                              {activity.completed ? "Completed lesson" : "Studied lesson"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={activity.completed ? "default" : "secondary"}>
                            {activity.completed ? "Completed" : "In Progress"}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(activity.lastAccessed)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                    <p className="text-gray-600">Start learning to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Completed Lessons
                </CardTitle>
                <CardDescription>All the lessons you've successfully completed</CardDescription>
              </CardHeader>
              <CardContent>
                {completedLessons.length > 0 ? (
                  <div className="space-y-4">
                    {completedLessons.map((lesson: any, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{getSubjectName(lesson.subjectId)}</p>
                            <p className="text-sm text-gray-600">Lesson completed</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="bg-green-600">
                            Completed
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(lesson.lastAccessed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed lessons</h3>
                    <p className="text-gray-600">Complete your first lesson to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Study Sessions
                </CardTitle>
                <CardDescription>Your daily learning sessions and time spent studying</CardDescription>
              </CardHeader>
              <CardContent>
                {studySessions.length > 0 ? (
                  <div className="space-y-4">
                    {studySessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{session.date.toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">
                              {session.activities} activities • {session.subjects} subjects
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{session.duration}min</p>
                          <p className="text-xs text-gray-500">Study time</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No study sessions</h3>
                    <p className="text-gray-600">Start studying to track your sessions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}