import { Calculator, FlaskRound, Atom, Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Subject } from "@shared/schema";

interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  onSelect: () => void;
  progress: number;
}

const iconMap = {
  calculator: Calculator,
  flask: FlaskRound,
  atom: Atom,
  book: Book,
};

export default function SubjectCard({ subject, isSelected, onSelect, progress }: SubjectCardProps) {
  const IconComponent = iconMap[subject.icon as keyof typeof iconMap] || Book;
  
  return (
    <div
      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-50 border-edu-blue"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      }`}
      onClick={onSelect}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
        style={{ backgroundColor: subject.color }}
      >
        <IconComponent className="text-white w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-dark-text">{subject.name}</h3>
        <p className="text-sm text-gray-600">{subject.description}</p>
      </div>
      <div className="w-8 h-8 bg-success-green rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">{progress}%</span>
      </div>
    </div>
  );
}
