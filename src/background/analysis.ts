
/**
 * Analysis functions and interaction analysis workflow
 */

import {
  calculateInitialBiasScore,
  calculatePrivacyScore,
  calculateSafetyScore,
  calculateTransparencyScore,
  recalculateBiasScore
} from "./scoring";

// Store analysis into the global map, and notify UI
export function analyzeInteraction(activeInteractions: Map<string, any>, interactionId: string, notify: (tabId: number, msg: any) => void): void {
  const interaction = activeInteractions.get(interactionId);
  if (!interaction) return;

  // Initial analysis based on request data
  const analysisResult = {
    biasScore: calculateInitialBiasScore(interaction),
    privacyScore: calculatePrivacyScore(interaction),
    safetyScore: null,
    transparencyScore: calculateTransparencyScore(interaction),
    timestamp: Date.now(),
    status: "partial"
  };

  interaction.analysis = analysisResult;
  activeInteractions.set(interactionId, interaction);

  // Notify UI of initial analysis
  notify(interaction.tabId, {
    type: "analysis_update",
    interactionId,
    analysis: analysisResult
  });
}

export function completeAnalysis(activeInteractions: Map<string, any>, interactionId: string, notify: (tabId: number, msg: any) => void): void {
  const interaction = activeInteractions.get(interactionId);
  if (!interaction || !interaction.analysis) return;

  const completed = {
    ...interaction.analysis,
    safetyScore: calculateSafetyScore(interaction),
    status: "complete"
  };
  completed.biasScore = recalculateBiasScore(interaction, completed.biasScore);

  interaction.analysis = completed;
  activeInteractions.set(interactionId, interaction);

  notify(interaction.tabId, {
    type: "analysis_complete",
    interactionId,
    analysis: completed
  });
}

export function getAnalysisResult(activeInteractions: Map<string, any>, interactionId: string): any {
  const interaction = activeInteractions.get(interactionId);
  return interaction?.analysis || null;
}
