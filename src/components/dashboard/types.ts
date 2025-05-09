
export interface AnalysisScore {
  score: number;
  level: string;
  details: string;
}

export interface AnalysisResult {
  biasScore: AnalysisScore;
  privacyScore: AnalysisScore;
  safetyScore: AnalysisScore;
  transparencyScore: AnalysisScore;
  timestamp: number;
  status: string;
}

export interface PageInfo {
  url: string;
  hasAIElements: boolean;
  detectedAIServices: string[];
  activeInteractions?: string[];
}

export interface DashboardProps {
  isAnalyzing: boolean;
  pageInfo: PageInfo;
}
