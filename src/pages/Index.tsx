
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Dashboard from '@/components/Dashboard';
import Settings from '@/components/Settings';
import About from '@/components/About';

interface PageInfo {
  url: string;
  hasAIElements: boolean;
  detectedAIServices: string[];
  activeInteractions?: string[];
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    url: "",
    hasAIElements: false,
    detectedAIServices: []
  });

  useEffect(() => {
    // For web extension environment
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      // Get current tab info
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          setPageInfo(prev => ({ ...prev, url: tabs[0].url || "" }));
          
          // Get AI detection info from content script
          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "get_page_info" }, (response) => {
              if (response && response.pageInfo) {
                setPageInfo(prev => ({
                  ...prev,
                  hasAIElements: response.pageInfo.hasAIElements,
                  detectedAIServices: response.pageInfo.detectedAIServices,
                  activeInteractions: response.pageInfo.activeInteractions
                }));
                
                if (response.pageInfo.activeInteractions && 
                    response.pageInfo.activeInteractions.length > 0) {
                  setIsAnalyzing(true);
                }
              }
            });
          }
        }
      });
    } else {
      // For development environment (non-extension)
      // Set mock data for demo
      setPageInfo({
        url: "https://example.com/ai-chat",
        hasAIElements: true,
        detectedAIServices: ["OpenAI", "Google AI"],
        activeInteractions: ["demo-interaction"]
      });
    }
  }, []);

  const startManualScan = () => {
    setIsAnalyzing(true);
    
    // Send message to background script to start manual analysis
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "start_manual_analysis" });
    }
    
    // Simulate analysis completing after 3 seconds
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="w-[350px] p-4 bg-sidebar text-sidebar-foreground">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
              <path d="M7 10v3"></path>
              <path d="M12 10v3"></path>
              <path d="M17 10v3"></path>
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Ethical Web Watchdog</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={startManualScan}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Scan Now"}
        </Button>
      </header>
      
      {pageInfo.hasAIElements ? (
        <Card className="p-3 bg-blue-50 border-blue-200 mb-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                AI detected on this page
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {pageInfo.detectedAIServices.length > 0 
                  ? `Services: ${pageInfo.detectedAIServices.join(', ')}` 
                  : 'AI integration detected'}
              </p>
            </div>
          </div>
        </Card>
      ) : null}
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Dashboard isAnalyzing={isAnalyzing} pageInfo={pageInfo} />
        </TabsContent>
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
        <TabsContent value="about">
          <About />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
