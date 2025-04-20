
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <div className="space-y-4 pt-3">
      <Card className="p-4">
        <h3 className="font-medium mb-2">Ethical Web Watchdog</h3>
        <p className="text-sm text-muted-foreground">
          An extension that analyzes AI interactions for ethical concerns in real-time.
        </p>
        
        <Separator className="my-3" />
        
        <h4 className="text-sm font-medium mb-1">How It Works</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
          <li>Detects AI systems on web pages</li>
          <li>Monitors interactions with AI services</li>
          <li>Analyzes requests and responses in real-time</li>
          <li>Evaluates ethics across multiple categories</li>
        </ul>
        
        <Separator className="my-3" />
        
        <h4 className="text-sm font-medium mb-1">Analysis Categories</h4>
        <div className="space-y-1.5 mt-2">
          <AnalysisCategory 
            title="Bias Detection" 
            description="Evaluates AI outputs for unfair treatment or stereotyping across demographic groups"
          />
          <AnalysisCategory 
            title="Privacy Analysis" 
            description="Assesses what user data is transmitted and how it might be used or stored"
          />
          <AnalysisCategory 
            title="Output Safety" 
            description="Checks AI responses for harmful content, misinformation, or dangerous advice"
          />
          <AnalysisCategory 
            title="Transparency" 
            description="Measures how open the AI system is about its capabilities and limitations"
          />
        </div>
      </Card>
      
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-2">Privacy Statement</h4>
        <p className="text-sm text-muted-foreground mb-3">
          This extension analyzes AI interactions locally in your browser. No data is sent to external servers.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Source
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Documentation
          </Button>
        </div>
      </Card>
      
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        <p className="text-xs text-muted-foreground">
          © 2025 Ethical Web Watchdog
        </p>
      </div>
    </div>
  );
};

const AnalysisCategory: React.FC<{ title: string; description: string }> = ({ 
  title, description 
}) => {
  return (
    <div className="bg-gray-50 p-2 rounded-md">
      <h5 className="text-sm font-medium">{title}</h5>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
};

export default About;
