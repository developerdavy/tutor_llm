import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Calendar, Clock } from "lucide-react";
import type { UserProgress } from "@shared/schema";

interface ProgressTrackerProps {
  userProgress?: any;
}

export default function ProgressTracker({ userProgress }: ProgressTrackerProps) {
  const progressArray = Array.isArray(userProgress) ? userProgress : [];
  const completedLessons = progressArray.filter((p: any) => p.completed).length || 0;
  const totalLessons = progressArray.length || 0;
  const studyStreak = 7; // TODO: Calculate actual streak
  const totalHours = 18.5; // TODO: Calculate actual hours

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-dark-text">Your Progress</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-success-green" />
              <span className="text-sm text-gray-600">Lessons Completed</span>
            </div>
            <span className="font-semibold text-success-green">{completedLessons}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-warm-orange" />
              <span className="text-sm text-gray-600">Study Streak</span>
            </div>
            <span className="font-semibold text-warm-orange">{studyStreak} days</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-edu-blue" />
              <span className="text-sm text-gray-600">Total Hours</span>
            </div>
            <span className="font-semibold text-edu-blue">{totalHours}h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
