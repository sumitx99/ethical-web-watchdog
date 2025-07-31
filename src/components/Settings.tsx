
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    // In a real extension, save to chrome.storage
    // chrome.storage.sync.set({ settings }, () => {
    //   console.log('Settings saved');
    // });
    
    // For now, just log
    console.log('Settings saved:', settings);
    
    // Show a temporary "Saved" message
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
      const originalText = saveButton.textContent;
      saveButton.textContent = 'Saved!';
      saveButton.setAttribute('disabled', 'true');
      
      setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.removeAttribute('disabled');
      }, 1500);
    }
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
      >
        Save Settings
      </Button>
    </div>
  );
};

export default Settings;
