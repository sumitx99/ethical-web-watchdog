
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AdvancedAnalysisProps {
  activateTestMode: boolean;
  handleTestModeActivate: () => void;
}

const AdvancedAnalysis: React.FC<AdvancedAnalysisProps> = ({ 
  activateTestMode, 
  handleTestModeActivate 
}) => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <div className="flex justify-between items-start">
        <div>
          <AlertTitle className="text-blue-800">Advanced Analysis</AlertTitle>
          <AlertDescription className="text-blue-600 text-sm">
            Test AI with adversarial prompts to reveal ethical boundaries
          </AlertDescription>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-1 bg-white"
          onClick={handleTestModeActivate}
          disabled={activateTestMode}
        >
          {activateTestMode ? "Testing..." : "Test AI"}
        </Button>
      </div>
    </Alert>
  );
};

export default AdvancedAnalysis;
