
/**
 * Scoring functions & Helper functions for AI analysis
 */

export function calculateInitialBiasScore(interaction: any): any {
  let biasScore = 85; // Start with good score
  let issues: string[] = [];
  
  // Extract text from request data
  const requestText = extractTextFromRequest(interaction.requestData);
  if (!requestText) return { score: biasScore, level: getBiasLevel(biasScore), details: "No prompt text found" };
  
  const lowerText = requestText.toLowerCase();
  
  // Check for potentially biased language patterns
  const biasIndicators = [
    { pattern: /\b(men|women|male|female)\s+(are|should|must|always|never)\b/gi, penalty: 15, type: "gender stereotyping" },
    { pattern: /\b(white|black|asian|hispanic|latino|arab|jewish)\s+(people|person)\s+(are|should|always|never)\b/gi, penalty: 20, type: "racial stereotyping" },
    { pattern: /\b(all\s+)?(men|women|boys|girls|muslims|christians|jews)\s+(are|do|should|never)\b/gi, penalty: 18, type: "group generalization" },
    { pattern: /\b(inferior|superior|better|worse)\s+(race|gender|religion)\b/gi, penalty: 25, type: "discriminatory comparison" },
    { pattern: /\b(ghetto|primitive|backwards|uncivilized)\b/gi, penalty: 12, type: "derogatory language" },
    { pattern: /\bstereotype\s+(about|of)\b/gi, penalty: 10, type: "explicit stereotype request" }
  ];
  
  biasIndicators.forEach(indicator => {
    const matches = requestText.match(indicator.pattern);
    if (matches) {
      biasScore -= indicator.penalty;
      issues.push(`${indicator.type}: "${matches[0]}"`);
    }
  });
  
  // Check for balanced language (positive indicators)
  const balancedLanguage = [
    /\b(diverse|inclusive|fair|equal|unbiased|balanced)\b/gi,
    /\b(consider\s+different\s+perspectives|avoid\s+bias|be\s+objective)\b/gi
  ];
  
  balancedLanguage.forEach(pattern => {
    if (requestText.match(pattern)) {
      biasScore += 5; // Small bonus for explicitly requesting balanced content
    }
  });
  
  biasScore = Math.max(0, Math.min(100, biasScore));
  
  const details = issues.length > 0 
    ? `Potential bias indicators found: ${issues.join(', ')}`
    : "No obvious bias indicators detected in prompt";
  
  return {
    score: biasScore,
    level: getBiasLevel(biasScore),
    details
  };
}

export function calculatePrivacyScore(interaction: any): any {
  let privacyScore = 80; // Start with decent score
  let concerns: string[] = [];
  
  const requestText = extractTextFromRequest(interaction.requestData);
  if (!requestText) return { score: privacyScore, level: getPrivacyLevel(privacyScore), details: "No request data to analyze" };
  
  // Check for personal information sharing
  const privacyRisks = [
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, penalty: 30, type: "SSN" },
    { pattern: /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, penalty: 25, type: "Credit card number" },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, penalty: 15, type: "Email address" },
    { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, penalty: 15, type: "Phone number" },
    { pattern: /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/gi, penalty: 20, type: "Street address" },
    { pattern: /\b(my name is|i am|call me)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?\b/gi, penalty: 10, type: "Full name" },
    { pattern: /\b(born|birthday|birthdate).*\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi, penalty: 15, type: "Birthdate" },
    { pattern: /\b(password|pin|access code|login)\s*(is|:)\s*\w+/gi, penalty: 35, type: "Authentication credentials" }
  ];
  
  privacyRisks.forEach(risk => {
    const matches = requestText.match(risk.pattern);
    if (matches) {
      privacyScore -= risk.penalty;
      concerns.push(`${risk.type}: ${matches.length} instance(s) detected`);
    }
  });
  
  // Check service privacy practices (based on known endpoints)
  const servicePrivacyScores = {
    "openai": -5,     // Known data usage for training
    "anthropic": 0,   // Better privacy practices
    "google": -10,    // Extensive data collection
    "meta": -15,      // Poor privacy track record
    "unknown": -5     // Uncertain practices
  };
  
  const serviceAdjustment = servicePrivacyScores[interaction.service] || 0;
  privacyScore += serviceAdjustment;
  if (serviceAdjustment < 0) {
    concerns.push(`Service privacy concerns for ${interaction.service}`);
  }
  
  privacyScore = Math.max(0, Math.min(100, privacyScore));
  
  const details = concerns.length > 0
    ? `Privacy concerns: ${concerns.join(', ')}`
    : "No obvious privacy risks detected";
  
  return {
    score: privacyScore,
    level: getPrivacyLevel(privacyScore),
    details
  };
}

export function calculateSafetyScore(interaction: any): any {
  let safetyScore = 90; // Start with high safety score
  let risks: string[] = [];
  
  // Analyze both request and response if available
  const requestText = extractTextFromRequest(interaction.requestData);
  const responseText = extractTextFromResponse(interaction.responseData);
  const allText = [requestText, responseText].filter(Boolean).join(' ');
  
  if (!allText) return { score: safetyScore, level: getSafetyLevel(safetyScore), details: "No content to analyze" };
  
  // Check for harmful content patterns
  const safetyRisks = [
    { pattern: /\b(how to (make|build|create).*(bomb|explosive|weapon|poison|drug))\b/gi, penalty: 40, type: "Dangerous instructions" },
    { pattern: /\b(suicide|self.harm|kill (myself|yourself)|end (my|your) life)\b/gi, penalty: 35, type: "Self-harm content" },
    { pattern: /\b(hack|exploit|breach|crack).*(password|account|system|database)\b/gi, penalty: 25, type: "Hacking instructions" },
    { pattern: /\b(illegal|unlawful).*(activities|drugs|weapons|fraud)\b/gi, penalty: 20, type: "Illegal activities" },
    { pattern: /\b(hate|violence|attack).*(against|toward).*(race|religion|gender|group)\b/gi, penalty: 30, type: "Hate speech" },
    { pattern: /\b(child|minor|underage).*(sexual|explicit|inappropriate)\b/gi, penalty: 50, type: "Child exploitation" },
    { pattern: /\b(doxxing|personal info|address|phone number).*(of|for).*(person|individual)\b/gi, penalty: 25, type: "Doxxing attempt" },
    { pattern: /\b(deepfake|fake (video|audio|image)).*(person|celebrity|individual)\b/gi, penalty: 20, type: "Deepfake creation" }
  ];
  
  safetyRisks.forEach(risk => {
    const matches = allText.match(risk.pattern);
    if (matches) {
      safetyScore -= risk.penalty;
      risks.push(`${risk.type}: ${matches.length} instance(s)`);
    }
  });
  
  // Check for educational/safety context (positive indicators)
  const safetyContexts = [
    /\b(for educational purposes|academic research|safety awareness|security training)\b/gi,
    /\b(how to (prevent|avoid|protect against|stay safe from))\b/gi
  ];
  
  safetyContexts.forEach(pattern => {
    if (allText.match(pattern)) {
      safetyScore += 10; // Bonus for legitimate educational context
    }
  });
  
  safetyScore = Math.max(0, Math.min(100, safetyScore));
  
  const details = risks.length > 0
    ? `Safety concerns identified: ${risks.join(', ')}`
    : "No obvious safety risks detected";
  
  return {
    score: safetyScore,
    level: getSafetyLevel(safetyScore),
    details
  };
}

export function calculateTransparencyScore(interaction: any): any {
  let transparencyScore = 50; // Start neutral
  let factors: string[] = [];
  
  // Base scores for known AI services and their transparency practices
  const serviceTransparency = {
    "openai": 65,      // Moderate transparency, some documentation
    "anthropic": 75,   // Better transparency practices, constitutional AI disclosure
    "google": 60,      // Mixed transparency
    "meta": 55,        // Limited transparency
    "cohere": 70,      // Good API documentation
    "perplexity": 60,  // Limited transparency about sources
    "unknown": 40      // Unknown service = poor transparency
  };
  
  transparencyScore = serviceTransparency[interaction.service] || serviceTransparency["unknown"];
  factors.push(`Base service transparency: ${interaction.service}`);
  
  // Check if the AI service provides clear disclosures
  const responseText = extractTextFromResponse(interaction.responseData);
  if (responseText) {
    // Look for AI disclosure patterns in response
    const disclosurePatterns = [
      /\b(I am|I'm)\s+(an\s+)?AI\b/gi,
      /\b(as an AI|AI (assistant|model|system))\b/gi,
      /\bI (don't|can't|cannot)\s+(access|browse|see)\b/gi,
      /\b(my training data|I was trained|as of my last update)\b/gi,
      /\b(I should note|disclaimer|please note)\b/gi
    ];
    
    let disclosureCount = 0;
    disclosurePatterns.forEach(pattern => {
      if (responseText.match(pattern)) {
        disclosureCount++;
      }
    });
    
    if (disclosureCount > 0) {
      transparencyScore += Math.min(20, disclosureCount * 5);
      factors.push(`AI disclosure indicators found: ${disclosureCount}`);
    } else {
      transparencyScore -= 10;
      factors.push("No clear AI disclosure found in response");
    }
    
    // Check for uncertainty expressions
    const uncertaintyPatterns = [
      /\b(I'm not sure|I don't know|uncertain|might be|could be|possibly)\b/gi,
      /\b(I cannot confirm|I'm not certain|this may not be accurate)\b/gi
    ];
    
    let uncertaintyCount = 0;
    uncertaintyPatterns.forEach(pattern => {
      const matches = responseText.match(pattern);
      if (matches) uncertaintyCount += matches.length;
    });
    
    if (uncertaintyCount > 0) {
      transparencyScore += Math.min(15, uncertaintyCount * 3);
      factors.push(`Appropriate uncertainty expressions: ${uncertaintyCount}`);
    }
  }
  
  // Check if request asks for transparency
  const requestText = extractTextFromRequest(interaction.requestData);
  if (requestText) {
    const transparencyRequests = [
      /\b(are you (an )?AI|what are you|explain your (capabilities|limitations))\b/gi,
      /\b(how do you work|what's your training|source of information)\b/gi
    ];
    
    transparencyRequests.forEach(pattern => {
      if (requestText.match(pattern)) {
        transparencyScore += 5; // Bonus for transparency-seeking queries
        factors.push("User requested transparency information");
      }
    });
  }
  
  transparencyScore = Math.max(0, Math.min(100, transparencyScore));
  
  const details = `Transparency assessment: ${factors.join(', ')}`;
  
  return {
    score: transparencyScore,
    level: getTransparencyLevel(transparencyScore),
    details
  };
}

export function recalculateBiasScore(interaction: any, initialScore: any): any {
  let adjustedScore = initialScore.score;
  let additionalIssues: string[] = [];
  
  // Analyze the AI response for bias
  const responseText = extractTextFromResponse(interaction.responseData);
  if (responseText) {
    // Check for biased responses
    const responseBiasPatterns = [
      { pattern: /\b(men are (generally|typically|usually) (better|stronger|smarter)\b)/gi, penalty: 15, type: "gender bias in response" },
      { pattern: /\b(women are (generally|typically|usually) (more|better at)\b)/gi, penalty: 15, type: "gender stereotyping in response" },
      { pattern: /\b(certain cultures|some races|those people) (tend to|are known for)\b/gi, penalty: 20, type: "cultural/racial bias" },
      { pattern: /\b(statistically|research shows).*(men|women|race|gender).*(better|worse|more|less)\b/gi, penalty: 10, type: "statistical bias justification" }
    ];
    
    responseBiasPatterns.forEach(pattern => {
      const matches = responseText.match(pattern.pattern);
      if (matches) {
        adjustedScore -= pattern.penalty;
        additionalIssues.push(pattern.type);
      }
    });
    
    // Check for balanced language in response
    const balancedResponsePatterns = [
      /\b(individual differences|varies by person|depends on the individual)\b/gi,
      /\b(diverse perspectives|multiple viewpoints|different experiences)\b/gi,
      /\b(avoid generalizations|important not to stereotype|varies widely)\b/gi
    ];
    
    balancedResponsePatterns.forEach(pattern => {
      if (responseText.match(pattern)) {
        adjustedScore += 8; // Bonus for balanced response
      }
    });
  }
  
  adjustedScore = Math.max(0, Math.min(100, adjustedScore));
  
  const updatedDetails = additionalIssues.length > 0
    ? `${initialScore.details}. Additional issues in response: ${additionalIssues.join(', ')}`
    : `${initialScore.details}. Response analysis complete - no additional bias detected`;
  
  return {
    ...initialScore,
    score: adjustedScore,
    level: getBiasLevel(adjustedScore),
    details: updatedDetails
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

// Helper functions to extract text from request/response data
function extractTextFromRequest(requestData: any): string {
  if (!requestData) return '';
  
  try {
    // Handle different request body formats
    if (typeof requestData === 'string') {
      // Try to parse as JSON
      const parsed = JSON.parse(requestData);
      return extractTextFromParsedData(parsed);
    } else if (typeof requestData === 'object') {
      return extractTextFromParsedData(requestData);
    }
  } catch (e) {
    // If parsing fails, try to extract from raw data
    if (requestData.raw && requestData.raw.length > 0) {
      try {
        const decoder = new TextDecoder();
        const text = decoder.decode(requestData.raw[0].bytes);
        const parsed = JSON.parse(text);
        return extractTextFromParsedData(parsed);
      } catch (e2) {
        // Last resort - return empty string
        return '';
      }
    }
  }
  
  return '';
}

function extractTextFromResponse(responseData: any): string {
  if (!responseData) return '';
  
  // This is harder to implement without actual response interception
  // For now, return empty string - would need more complex response monitoring
  return '';
}

function extractTextFromParsedData(data: any): string {
  if (!data) return '';
  
  // Common AI API formats
  if (data.messages && Array.isArray(data.messages)) {
    // OpenAI-style messages
    return data.messages
      .filter((msg: any) => msg.role === 'user' || msg.role === 'system')
      .map((msg: any) => msg.content || '')
      .join(' ');
  }
  
  if (data.prompt) {
    // Simple prompt field
    return data.prompt;
  }
  
  if (data.input) {
    // Generic input field
    return data.input;
  }
  
  if (data.text) {
    // Generic text field
    return data.text;
  }
  
  // Try to find any string values in the object
  const textValues: string[] = [];
  function findStrings(obj: any) {
    if (typeof obj === 'string' && obj.length > 10) {
      textValues.push(obj);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(findStrings);
    }
  }
  
  findStrings(data);
  return textValues.join(' ');
}
