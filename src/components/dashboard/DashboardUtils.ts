
import { AnalysisScore, AnalysisResult } from './types';

export const generateDemoData = (previousResult?: AnalysisResult | null): AnalysisResult => {
  // Create realistic demo data for visualization
  const generateScore = (baseScore?: number) => {
    // If analyzing, show gradually improving scores
    const score = baseScore !== undefined 
      ? Math.min(100, baseScore + Math.random() * 5)
      : Math.floor(Math.random() * 100);
    
    const getLevel = (score: number) => {
      if (score > 80) return "good";
      if (score > 50) return "moderate";
      return "poor";
    };
    
    return {
      score,
      level: getLevel(score),
      details: "Analysis details would appear here"
    };
  };
  
  return {
    biasScore: generateScore(previousResult?.biasScore?.score),
    privacyScore: generateScore(previousResult?.privacyScore?.score),
    safetyScore: generateScore(previousResult?.safetyScore?.score),
    transparencyScore: generateScore(previousResult?.transparencyScore?.score),
    timestamp: Date.now(),
    status: previousResult ? "partial" : "complete"
  };
};

export const calculateOverallScore = (analysisResult: AnalysisResult): number => {
  const scores = [
    analysisResult.biasScore?.score || 0,
    analysisResult.privacyScore?.score || 0,
    analysisResult.safetyScore?.score || 0,
    analysisResult.transparencyScore?.score || 0
  ];
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

export const getOverallRating = (score: number): { rating: string, color: string } => {
  let rating = "Good";
  let color = "bg-green-100 text-green-800";
  
  if (score < 60) {
    rating = "Moderate";
    color = "bg-amber-100 text-amber-800";
  }
  if (score < 40) {
    rating = "Poor";
    color = "bg-red-100 text-red-800";
  }
  
  return { rating, color };
};
