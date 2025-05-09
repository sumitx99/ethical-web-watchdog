
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OverallScoreProps {
  score: number;
  rating: string;
  ratingColor: string;
}

const OverallScore: React.FC<OverallScoreProps> = ({ score, rating, ratingColor }) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Overall Ethics Rating</h3>
        <Badge className={ratingColor}>{rating}</Badge>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full mb-1">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" 
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-right text-muted-foreground">Score: {score}/100</p>
    </Card>
  );
};

export default OverallScore;
