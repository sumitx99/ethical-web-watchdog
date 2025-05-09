
import React from 'react';
import ScoreCategory from './ScoreCategory';
import { AnalysisResult } from './types';

interface ScoreCategoriesProps {
  analysisResult: AnalysisResult;
  isAnalyzing: boolean;
}

const ScoreCategories: React.FC<ScoreCategoriesProps> = ({ analysisResult, isAnalyzing }) => {
  return (
    <div className="space-y-3">
      <ScoreCategory 
        title="Bias Detection" 
        score={analysisResult.biasScore} 
        explanation="Measures demographic fairness in AI responses" 
        isLoading={isAnalyzing && !analysisResult.biasScore}
      />
      
      <ScoreCategory 
        title="Privacy Analysis" 
        score={analysisResult.privacyScore} 
        explanation="Evaluates how user data is handled" 
        isLoading={isAnalyzing && !analysisResult.privacyScore}
      />
      
      <ScoreCategory 
        title="Output Safety" 
        score={analysisResult.safetyScore} 
        explanation="Checks for harmful or dangerous content" 
        isLoading={isAnalyzing && !analysisResult.safetyScore}
      />
      
      <ScoreCategory 
        title="Transparency" 
        score={analysisResult.transparencyScore} 
        explanation="Assesses disclosure about AI operations" 
        isLoading={isAnalyzing && !analysisResult.transparencyScore}
      />
    </div>
  );
};

export default ScoreCategories;
