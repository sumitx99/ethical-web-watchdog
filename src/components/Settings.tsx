import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Download, MessageSquare, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoScan: true,
    detailedReports: false,
    adversarialTesting: false,
    sensitivityThreshold: 70,
    aiServicesList: [
      { id: 'openai', name: 'OpenAI', enabled: true },
      { id: 'anthropic', name: 'Anthropic', enabled: true },
      { id: 'google', name: 'Google AI', enabled: true },
      { id: 'perplexity', name: 'Perplexity', enabled: true },
      { id: 'cohere', name: 'Cohere', enabled: false },
      { id: 'meta', name: 'Meta AI', enabled: false },
    ]
  });
  
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [complainCategory, setComplainCategory] = useState('bias');
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load settings from storage on component mount
  useEffect(() => {
    // In a real extension, load from chrome.storage
    // For now, we'll use localStorage for demo purposes
    const savedSettings = localStorage.getItem('ethicalWatchdogSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleServiceToggle = (id: string) => {
    setSettings(prev => ({
      ...prev,
      aiServicesList: prev.aiServicesList.map(service => 
        service.id === id ? { ...service, enabled: !service.enabled } : service
      )
    }));
  };

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setSettings(prev => ({
        ...prev,
        sensitivityThreshold: value
      }));
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // In a real extension, save to chrome.storage
    // For demo, save to localStorage
    localStorage.setItem('ethicalWatchdogSettings', JSON.stringify(settings));
    
    // Simulate a delay to show the saving state
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
      });
    }, 800);
  };

  const handleComplaintSubmit = () => {
    if (complaintText.trim().length < 10) {
      toast({
        title: "Complaint too short",
        description: "Please provide more details about your complaint",
        variant: "destructive"
      });
      return;
    }
    
    // In a real extension, send to backend
    console.log('Complaint submitted:', { 
      category: complainCategory,
      text: complaintText 
    });
    
    // Show success message and reset form
    toast({
      title: "Complaint submitted",
      description: "Thank you for your feedback. We'll review it shortly.",
    });
    
    setComplaintText('');
    setComplaintOpen(false);
  };

  const handleDownloadReport = () => {
    // In a real extension, generate actual report
    const mockReport = {
      timestamp: new Date().toISOString(),
      detectionSettings: {
        sensitivity: settings.sensitivityThreshold,
        monitoredServices: settings.aiServicesList.filter(s => s.enabled).map(s => s.name)
      },
      recentScores: {
        bias: 75,
        privacy: 85,
        safety: 60,
        transparency: 70
      }
    };
    
    // Convert to string
    const reportString = JSON.stringify(mockReport, null, 2);
    
    // Create blob and download
    const blob = new Blob([reportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `ai-ethics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report downloaded",
      description: `Report saved as ${downloadFormat.toUpperCase()} file`,
    });
  };

  return (
    <div className="space-y-4 pt-3">
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-medium mb-2">General Settings</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications" className="text-sm">Notifications</Label>
            <p className="text-xs text-muted-foreground">Get alerts about ethical issues</p>
          </div>
          <Switch 
            id="notifications" 
            checked={settings.notifications}
            onCheckedChange={() => handleToggle('notifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-scan" className="text-sm">Auto-Scan</Label>
            <p className="text-xs text-muted-foreground">Automatically analyze AI interactions</p>
          </div>
          <Switch 
            id="auto-scan" 
            checked={settings.autoScan}
            onCheckedChange={() => handleToggle('autoScan')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="detailed-reports" className="text-sm">Detailed Reports</Label>
            <p className="text-xs text-muted-foreground">Generate comprehensive analysis</p>
          </div>
          <Switch 
            id="detailed-reports" 
            checked={settings.detailedReports}
            onCheckedChange={() => handleToggle('detailedReports')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="adversarial-testing" className="text-sm">Adversarial Testing</Label>
            <p className="text-xs text-muted-foreground">Test AI with challenging prompts</p>
          </div>
          <Switch 
            id="adversarial-testing" 
            checked={settings.adversarialTesting}
            onCheckedChange={() => handleToggle('adversarialTesting')}
          />
        </div>
        
        <Separator />
        
        <div>
          <Label htmlFor="sensitivity" className="text-sm">Detection Sensitivity</Label>
          <div className="flex items-center gap-3 mt-2">
            <Input
              id="sensitivity"
              type="range"
              min="0"
              max="100"
              value={settings.sensitivityThreshold}
              onChange={handleSensitivityChange}
              className="w-full"
            />
            <span className="text-xs font-medium w-8 text-right">
              {settings.sensitivityThreshold}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Higher values mean more strict ethical evaluations
          </p>
        </div>
      </Card>
      
      {/* Detailed Report Section */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Detailed Reports</h3>
          <Badge variant="outline" className="font-normal">
            {settings.detailedReports ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            When detailed reports are enabled, comprehensive analyses of AI interactions 
            will be saved and available for download.
          </p>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="report-format" className="text-sm">Format:</Label>
            <select 
              id="report-format" 
              className="text-xs border rounded px-2 py-1"
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadReport}
              className="ml-auto"
            >
              <Download className="mr-1 h-4 w-4" />
              Download Latest
            </Button>
          </div>
        </div>
        
        {/* Complaint System */}
        <Collapsible
          open={complaintOpen}
          onOpenChange={setComplaintOpen}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Report Issues or Complaints</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <MessageSquare className="mr-1 h-4 w-4" />
                {complaintOpen ? "Close" : "Open"}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              If you believe an AI service's ethical score is incorrect or you've encountered 
              problematic AI behavior, please provide details below:
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="complaint-category" className="text-xs">Issue Category</Label>
              <select 
                id="complaint-category"
                className="w-full text-sm border rounded px-3 py-1.5"
                value={complainCategory}
                onChange={(e) => setComplainCategory(e.target.value)}
              >
                <option value="bias">AI Bias Detection</option>
                <option value="privacy">Privacy Concerns</option>
                <option value="safety">Safety Issues</option>
                <option value="transparency">Transparency Problems</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="complaint-text" className="text-xs">Your Complaint</Label>
              <Textarea
                id="complaint-text"
                placeholder="Describe the issue in detail..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                className="w-full h-24 text-sm"
              />
            </div>
            
            <Button 
              size="sm"
              onClick={handleComplaintSubmit}
              className="w-full"
            >
              Submit Complaint
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Monitored AI Services</h3>
        <div className="grid grid-cols-2 gap-2">
          {settings.aiServicesList.map(service => (
            <div 
              key={service.id}
              className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => handleServiceToggle(service.id)}
            >
              <Switch 
                id={`service-${service.id}`}
                checked={service.enabled}
                onCheckedChange={() => handleServiceToggle(service.id)}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor={`service-${service.id}`} className="text-sm cursor-pointer">
                {service.name}
              </Label>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">
            Active monitoring: <Badge variant="outline" className="ml-1 font-normal">
              {settings.aiServicesList.filter(s => s.enabled).length} services
            </Badge>
          </p>
        </div>
      </Card>
      
      <Button 
        className="w-full" 
        onClick={handleSave}
        id="save-button"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> 
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
};

export default Settings;
