import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Calendar, Target, BookOpen, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout";
import type { Subject, UserProgress } from "@shared/schema";

export default function ProgressPage() {
  const { user } = useAuth();

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const getOverallStats = () => {
    if (!userProgress || !Array.isArray(userProgress) || !userProgress.length) {
      return { totalCompleted: 0, totalInProgress: 0, averageProgress: 0 };
    }
    const completed = userProgress.filter((p: any) => p.completed).length;
    const inProgress = userProgress.filter((p: any) => !p.completed && p.progress > 0).length;
    const averageProgress = userProgress.reduce((acc: number, p: any) => acc + (p.progress || 0), 0) / userProgress.length;
    
    return {
      totalCompleted: completed,
      totalInProgress: inProgress,
      averageProgress: Math.round(averageProgress)
    };
  };

  const getSubjectBreakdown = () => {
    if (!userProgress || !Array.isArray(userProgress) || !userProgress.length || !subjects) return [];
    
    const subjectStats = subjects.map((subject) => {
      const subjectProgress = userProgress.filter((p: any) => p.subjectId === subject.id);
      const completed = subjectProgress.filter((p: any) => p.completed).length;
      const total = subjectProgress.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        ...subject,
        progress,
        completed,
        total
      };
    });

    return subjectStats;
  };

  const getDailyActivity = () => {
    if (!userProgress || !Array.isArray(userProgress) || !userProgress.length) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    return last7Days.map((dateStr: string) => {
      const dayProgress = userProgress.filter((p: any) => {
        if (!p.lastAccessed) return false;
        return new Date(p.lastAccessed).toDateString() === dateStr;
      });

      return {
        date: new Date(dateStr),
        activities: dayProgress.length,
        progress: dayProgress.reduce((acc: number, p: any) => acc + (p.progress || 0), 0)
      };
    });
  };

  const overallStats = getOverallStats();
  const subjectBreakdown = getSubjectBreakdown();
  const dailyActivity = getDailyActivity();

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
            <p className="text-gray-600">Monitor your learning journey and achievements</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">By Subject</TabsTrigger>
              <TabsTrigger value="daily">Daily Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overallStats.totalCompleted}</div>
                    <p className="text-xs text-muted-foreground">
                      Great job on completing lessons!
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overallStats.totalInProgress}</div>
                    <p className="text-xs text-muted-foreground">
                      Keep going with these lessons
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overallStats.averageProgress}%</div>
                    <p className="text-xs text-muted-foreground">
                      Overall learning progress
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjectBreakdown.map((subject: any) => (
                  <Card key={subject.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: subject.color }}
                        >
                          {subject.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                          <CardDescription>{subject.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {subject.completed}/{subject.total} completed
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {subject.total - subject.completed} remaining
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {subjectBreakdown.length === 0 && (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data</h3>
                  <p className="text-gray-600">Start learning to see your progress by subject</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="daily" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Daily Activity (Last 7 Days)
                  </CardTitle>
                  <CardDescription>Your learning activity over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyActivity.length > 0 ? (
                    <div className="space-y-4">
                      {dailyActivity.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{day.date.toLocaleDateString()}</p>
                              <p className="text-sm text-gray-600">{day.date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{day.activities} activities</p>
                            <p className="text-sm text-gray-600">{day.progress}% progress</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                      <p className="text-gray-600">Start learning to see your daily activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}