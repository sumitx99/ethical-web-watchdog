
/**
 * Scoring functions & Helper functions for AI analysis
 */

export function calculateInitialBiasScore(interaction: any): any {
  const biasScore = Math.random() * 100; // Placeholder
  return {
    score: biasScore,
    level: getBiasLevel(biasScore),
    details: "Initial bias assessment based on prompt analysis"
  };
}

export function calculatePrivacyScore(interaction: any): any {
  const privacyScore = Math.random() * 100; // Placeholder
  return {
    score: privacyScore,
    level: getPrivacyLevel(privacyScore),
    details: "Assessment of personal data shared with AI service"
  };
}

export function calculateSafetyScore(interaction: any): any {
  const safetyScore = Math.random() * 100; // Placeholder
  return {
    score: safetyScore,
    level: getSafetyLevel(safetyScore),
    details: "Analysis of potential harmful content in AI response"
  };
}

export function calculateTransparencyScore(interaction: any): any {
  const transparencyScore = Math.random() * 100; // Placeholder
  return {
    score: transparencyScore,
    level: getTransparencyLevel(transparencyScore),
    details: "Evaluation of AI service transparency"
  };
}

export function recalculateBiasScore(interaction: any, initialScore: any): any {
  // Refine bias score based on response data
  const adjustedScore = Math.min(100, Math.max(0, initialScore.score + (Math.random() * 20 - 10)));
  return {
    ...initialScore,
    score: adjustedScore,
    level: getBiasLevel(adjustedScore),
    details: "Complete bias assessment based on request and response analysis"
  };
}

// Helper functions for scoring levels

export function getBiasLevel(score: number): string {
  if (score > 80) return "high";
  if (score > 50) return "medium";
  return "low";
}

export function getPrivacyLevel(score: number): string {
  if (score > 80) return "good";
  if (score > 50) return "moderate";
  return "poor";
}

export function getSafetyLevel(score: number): string {
  if (score > 80) return "safe";
  if (score > 50) return "moderate";
  return "unsafe";
}

export function getTransparencyLevel(score: number): string {
  if (score > 80) return "transparent";
  if (score > 50) return "moderate";
  return "opaque";
}
