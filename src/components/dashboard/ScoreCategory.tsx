
import React from 'react';
import { Card } from "@/components/ui/card";

interface AnalysisScore {
  score: number;
  level: string;
  details: string;
}

interface ScoreCategoryProps {
  title: string;
  score: AnalysisScore;
  explanation: string;
  isLoading?: boolean;
}

const ScoreCategory: React.FC<ScoreCategoryProps> = ({ 
  title, score, explanation, isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="p-3">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="mt-2 animate-pulse">
          <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
          <p className="text-xs text-muted-foreground mt-1">{explanation}</p>
        </div>
      </Card>
    );
  }
  
  // Determine color based on score level
  let progressColor = "bg-green-500";
  if (score.level === "moderate") progressColor = "bg-amber-500";
  if (score.level === "poor") progressColor = "bg-red-500";
  
  // For inverted metrics (where lower is better)
  if (title === "Bias Detection") {
    if (score.level === "good") progressColor = "bg-green-500";
    if (score.level === "moderate") progressColor = "bg-amber-500";
    if (score.level === "high") progressColor = "bg-red-500";
  }
  
  return (
    <Card className="p-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs font-medium">{Math.round(score.score)}/100</p>
      </div>
      <div className="my-1.5">
        <div className="h-1.5 w-full bg-gray-200 rounded-full">
          <div 
            className={`h-full rounded-full ${progressColor}`}
            style={{ width: `${score.score}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{explanation}</p>
    </Card>
  );
};

export default ScoreCategory;
