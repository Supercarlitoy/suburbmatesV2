"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Settings,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Zap,
  BarChart3,
  Activity,
  RefreshCw,
  Save,
  Undo,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Target,
  TrendingUp,
  Clock,
  Users,
  Building,
  Sliders,
  Filter,
  Search,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Power,
  PowerOff,
  Gauge,
  Wrench,
  Database,
  Code,
  FileText,
  History,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIConfiguration {
  // Core System Settings
  systemEnabled: boolean;
  maintenanceMode: boolean;
  processNewSubmissions: boolean;
  batchProcessingEnabled: boolean;
  
  // Confidence Thresholds
  confidenceThresholds: {
    autoApprove: number; // 85-100
    autoReject: number;  // 85-100
    manualReview: {
      min: number; // 20-84
      max: number; // 20-84
    };
  };
  
  // Quality Thresholds
  qualityThresholds: {
    minimumQualityScore: number; // 0-100
    requiredFields: string[];
    abnStatusRequired: boolean;
    duplicateCheckEnabled: boolean;
    maxDuplicatesAllowed: number;
  };
  
  // Risk Assessment
  riskAssessment: {
    highRiskThreshold: number; // 0-100
    mediumRiskThreshold: number; // 0-100
    riskFactors: {
      abnStatus: number;
      businessAge: number;
      qualityScore: number;
      duplicateCount: number;
      missingFields: number;
    };
  };
  
  // Priority Scoring
  priorityScoring: {
    agingWeight: number; // 0-1
    qualityWeight: number; // 0-1
    riskWeight: number; // 0-1
    businessValueWeight: number; // 0-1
    highPriorityThreshold: number; // 0-100
    mediumPriorityThreshold: number; // 0-100
  };
  
  // Batch Processing Rules
  batchProcessingRules: {
    maxBatchSize: number;
    processingIntervalMinutes: number;
    requireManualApprovalAbove: number; // businesses count
    pauseBatchingOnHighQueue: boolean;
    highQueueThreshold: number;
  };
  
  // Business Category Rules
  categoryRules: {
    [category: string]: {
      enabled: boolean;
      confidenceAdjustment: number; // -20 to +20
      priorityAdjustment: number; // -20 to +20
      specialRequirements: string[];
      autoProcessingEnabled: boolean;
    };
  };
  
  // Notification Settings
  notifications: {
    adminAlerts: boolean;
    businessOwnerNotifications: boolean;
    escalationThresholds: {
      queueSize: number;
      oldestPendingDays: number;
      lowConfidenceCount: number;
    };
    emailTemplates: {
      [key: string]: {
        enabled: boolean;
        template: string;
      };
    };
  };
  
  // Performance Settings
  performance: {
    enableCaching: boolean;
    cacheExpiryMinutes: number;
    enablePreprocessing: boolean;
    parallelProcessingEnabled: boolean;
    maxConcurrentProcessing: number;
  };
  
  // Audit & Logging
  auditSettings: {
    logAllDecisions: boolean;
    retainLogsMonths: number;
    enablePerformanceMetrics: boolean;
    enableAccuracyTracking: boolean;
  };
  
  // System Metadata
  lastModified: string;
  modifiedBy: string;
  version: string;
  appliedAt: string;
}

interface ConfigurationHistory {
  id: string;
  timestamp: string;
  modifiedBy: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }[];
  appliedSuccessfully: boolean;
  rollbackAvailable: boolean;
}

interface AIControlsInterfaceProps {
  className?: string;
}

export default function AIControlsInterface({ className }: AIControlsInterfaceProps) {
  // State management
  const [configuration, setConfiguration] = useState<AIConfiguration | null>(null);
  const [originalConfiguration, setOriginalConfiguration] = useState<AIConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [configurationHistory, setConfigurationHistory] = useState<ConfigurationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('thresholds');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [previewChanges, setPreviewChanges] = useState(false);

  // Load configuration
  const fetchConfiguration = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ai-automation/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConfiguration(data);
        setOriginalConfiguration(JSON.parse(JSON.stringify(data))); // Deep copy
        setHasChanges(false);
      } else {
        console.error('Failed to fetch AI configuration:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching AI configuration:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load configuration history
  const fetchConfigurationHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/ai-automation/config/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConfigurationHistory(data);
      }
    } catch (error) {
      console.error('Error fetching configuration history:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConfiguration();
    fetchConfigurationHistory();
  }, [fetchConfiguration, fetchConfigurationHistory]);

  // Check for changes
  useEffect(() => {
    if (configuration && originalConfiguration) {
      const hasChanges = JSON.stringify(configuration) !== JSON.stringify(originalConfiguration);
      setHasChanges(hasChanges);
    }
  }, [configuration, originalConfiguration]);

  // Update configuration helper
  const updateConfiguration = (path: string[], value: any) => {
    if (!configuration) return;
    
    const newConfig = JSON.parse(JSON.stringify(configuration));
    let current = newConfig;
    
    // Navigate to the parent object
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Set the final value
    current[path[path.length - 1]] = value;
    
    setConfiguration(newConfig);
  };

  // Save configuration
  const saveConfiguration = async (reason: string = '') => {
    if (!configuration || !hasChanges) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/ai-automation/config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configuration,
          reason,
          testMode
        }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setConfiguration(updatedConfig);
        setOriginalConfiguration(JSON.parse(JSON.stringify(updatedConfig)));
        setHasChanges(false);
        await fetchConfigurationHistory();
      } else {
        console.error('Failed to save configuration:', response.statusText);
        alert('Failed to save configuration. Please try again.');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to original
  const resetConfiguration = () => {
    if (originalConfiguration) {
      setConfiguration(JSON.parse(JSON.stringify(originalConfiguration)));
      setHasChanges(false);
    }
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading AI configuration...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!configuration) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-medium">Failed to Load AI Configuration</h3>
              <p className="text-sm text-gray-600">Please check your permissions and try again.</p>
              <Button onClick={fetchConfiguration} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Controls</h1>
            <p className="text-gray-600">
              Configure AI automation thresholds, rules, and system behavior
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={testMode}
                onCheckedChange={setTestMode}
                id="test-mode"
              />
              <Label htmlFor="test-mode" className="text-sm">Test Mode</Label>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
            <Button
              variant="outline"
              onClick={resetConfiguration}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Undo className="h-4 w-4" />
              Reset
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  disabled={!hasChanges || saving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Configuration Changes</DialogTitle>
                </DialogHeader>
                <SaveConfigurationDialog 
                  onSave={saveConfiguration}
                  testMode={testMode}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    {configuration.systemEnabled ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Disabled</span>
                      </>
                    )}
                  </p>
                </div>
                <Power className={cn("h-8 w-8", configuration.systemEnabled ? "text-green-500" : "text-gray-400")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Auto-Approve</p>
                  <p className="text-lg font-bold text-blue-600">
                    {configuration.confidenceThresholds.autoApprove}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Confidence threshold</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Batch Processing</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    {configuration.batchProcessingEnabled ? (
                      <>
                        <Zap className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">ON</span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">OFF</span>
                      </>
                    )}
                  </p>
                </div>
                <Gauge className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Max: {configuration.batchProcessingRules.maxBatchSize}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(configuration.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                By {configuration.modifiedBy}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Changes Alert */}
        {hasChanges && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unsaved Changes</AlertTitle>
            <AlertDescription>
              You have unsaved configuration changes. Make sure to save before leaving this page.
              {testMode && " Test mode is enabled - changes will be validated but not applied immediately."}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Configuration History Sidebar */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Configuration History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {configurationHistory.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                    <Badge className={entry.appliedSuccessfully ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {entry.appliedSuccessfully ? 'Applied' : 'Failed'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Modified by {entry.modifiedBy}</p>
                  <div className="space-y-1">
                    {entry.changes.slice(0, 3).map((change, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium">{change.field}:</span>
                        <span className="text-gray-600"> {change.oldValue} → {change.newValue}</span>
                      </div>
                    ))}
                    {entry.changes.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{entry.changes.length - 3} more changes
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Confidence Thresholds Tab */}
        <TabsContent value="thresholds" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto-Approve Threshold */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Auto-Approve Threshold
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Businesses above this confidence score will be automatically approved
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Confidence Score</Label>
                    <span className="text-2xl font-bold text-green-600">
                      {configuration.confidenceThresholds.autoApprove}%
                    </span>
                  </div>
                  <Slider
                    value={[configuration.confidenceThresholds.autoApprove]}
                    onValueChange={(values) => 
                      updateConfiguration(['confidenceThresholds', 'autoApprove'], values[0])
                    }
                    min={85}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>85% (Conservative)</span>
                    <span>100% (Strict)</span>
                  </div>
                </div>
                <Alert className="border-green-200 bg-green-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Current setting will auto-approve businesses with {configuration.confidenceThresholds.autoApprove}%+ confidence
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Auto-Reject Threshold */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Auto-Reject Threshold
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Businesses above this confidence score will be automatically rejected
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Confidence Score</Label>
                    <span className="text-2xl font-bold text-red-600">
                      {configuration.confidenceThresholds.autoReject}%
                    </span>
                  </div>
                  <Slider
                    value={[configuration.confidenceThresholds.autoReject]}
                    onValueChange={(values) => 
                      updateConfiguration(['confidenceThresholds', 'autoReject'], values[0])
                    }
                    min={85}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>85% (Conservative)</span>
                    <span>100% (Strict)</span>
                  </div>
                </div>
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Current setting will auto-reject businesses with {configuration.confidenceThresholds.autoReject}%+ confidence for rejection
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Manual Review Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Manual Review Range
              </CardTitle>
              <p className="text-sm text-gray-600">
                Businesses within this confidence range require manual admin review
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Confidence</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={configuration.confidenceThresholds.manualReview.min}
                      onChange={(e) => 
                        updateConfiguration(
                          ['confidenceThresholds', 'manualReview', 'min'], 
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>
                <div>
                  <Label>Maximum Confidence</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={configuration.confidenceThresholds.manualReview.max}
                      onChange={(e) => 
                        updateConfiguration(
                          ['confidenceThresholds', 'manualReview', 'max'], 
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Manual Review Range:</strong> {configuration.confidenceThresholds.manualReview.min}% - {configuration.confidenceThresholds.manualReview.max}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Businesses with confidence scores in this range will be queued for manual review
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quality Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Quality Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Minimum Quality Score</Label>
                  <span className="text-lg font-bold">
                    {configuration.qualityThresholds.minimumQualityScore}/100
                  </span>
                </div>
                <Slider
                  value={[configuration.qualityThresholds.minimumQualityScore]}
                  onValueChange={(values) => 
                    updateConfiguration(['qualityThresholds', 'minimumQualityScore'], values[0])
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="abn-required">ABN Status Required</Label>
                <Switch
                  id="abn-required"
                  checked={configuration.qualityThresholds.abnStatusRequired}
                  onCheckedChange={(checked) => 
                    updateConfiguration(['qualityThresholds', 'abnStatusRequired'], checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="duplicate-check">Enable Duplicate Detection</Label>
                <Switch
                  id="duplicate-check"
                  checked={configuration.qualityThresholds.duplicateCheckEnabled}
                  onCheckedChange={(checked) => 
                    updateConfiguration(['qualityThresholds', 'duplicateCheckEnabled'], checked)
                  }
                />
              </div>

              {configuration.qualityThresholds.duplicateCheckEnabled && (
                <div>
                  <Label>Max Allowed Duplicates</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={configuration.qualityThresholds.maxDuplicatesAllowed}
                    onChange={(e) => 
                      updateConfiguration(
                        ['qualityThresholds', 'maxDuplicatesAllowed'], 
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment & Priority Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Risk Assessment Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>High Risk Threshold</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Slider
                      value={[configuration.riskAssessment.highRiskThreshold]}
                      onValueChange={(values) => 
                        updateConfiguration(['riskAssessment', 'highRiskThreshold'], values[0])
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">
                      {configuration.riskAssessment.highRiskThreshold}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Medium Risk Threshold</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Slider
                      value={[configuration.riskAssessment.mediumRiskThreshold]}
                      onValueChange={(values) => 
                        updateConfiguration(['riskAssessment', 'mediumRiskThreshold'], values[0])
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">
                      {configuration.riskAssessment.mediumRiskThreshold}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Risk Factor Weights</Label>
                  {Object.entries(configuration.riskAssessment.riskFactors).map(([factor, weight]) => (
                    <div key={factor} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[weight]}
                          onValueChange={(values) => 
                            updateConfiguration(['riskAssessment', 'riskFactors', factor], values[0])
                          }
                          min={0}
                          max={100}
                          step={5}
                          className="w-24"
                        />
                        <span className="text-xs w-8">{weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Scoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Priority Scoring Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>High Priority Threshold</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Slider
                      value={[configuration.priorityScoring.highPriorityThreshold]}
                      onValueChange={(values) => 
                        updateConfiguration(['priorityScoring', 'highPriorityThreshold'], values[0])
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">
                      {configuration.priorityScoring.highPriorityThreshold}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Medium Priority Threshold</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Slider
                      value={[configuration.priorityScoring.mediumPriorityThreshold]}
                      onValueChange={(values) => 
                        updateConfiguration(['priorityScoring', 'mediumPriorityThreshold'], values[0])
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">
                      {configuration.priorityScoring.mediumPriorityThreshold}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Priority Factor Weights</Label>
                  {Object.entries(configuration.priorityScoring).filter(([key]) => key.endsWith('Weight')).map(([factor, weight]) => (
                    <div key={factor} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {factor.replace('Weight', '').replace(/([A-Z])/g, ' $1')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[weight as number]}
                          onValueChange={(values) => 
                            updateConfiguration(['priorityScoring', factor], values[0] / 100)
                          }
                          min={0}
                          max={100}
                          step={5}
                          className="w-24"
                        />
                        <span className="text-xs w-8">{Math.round((weight as number) * 100)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batch Processing Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Batch Processing Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Max Batch Size</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={configuration.batchProcessingRules.maxBatchSize}
                    onChange={(e) => 
                      updateConfiguration(
                        ['batchProcessingRules', 'maxBatchSize'], 
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Processing Interval (minutes)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1440}
                    value={configuration.batchProcessingRules.processingIntervalMinutes}
                    onChange={(e) => 
                      updateConfiguration(
                        ['batchProcessingRules', 'processingIntervalMinutes'], 
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Manual Approval Above (count)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    value={configuration.batchProcessingRules.requireManualApprovalAbove}
                    onChange={(e) => 
                      updateConfiguration(
                        ['batchProcessingRules', 'requireManualApprovalAbove'], 
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pause-on-high-queue">Pause on High Queue</Label>
                  <Switch
                    id="pause-on-high-queue"
                    checked={configuration.batchProcessingRules.pauseBatchingOnHighQueue}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['batchProcessingRules', 'pauseBatchingOnHighQueue'], checked)
                    }
                  />
                </div>

                {configuration.batchProcessingRules.pauseBatchingOnHighQueue && (
                  <div>
                    <Label>High Queue Threshold</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10000}
                      value={configuration.batchProcessingRules.highQueueThreshold}
                      onChange={(e) => 
                        updateConfiguration(
                          ['batchProcessingRules', 'highQueueThreshold'], 
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Category Rules Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-500" />
                Business Category Rules
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure category-specific rules and adjustments for AI processing
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(configuration.categoryRules).map(([category, rules]) => (
                  <div key={category} className="border rounded-lg">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleCategoryExpansion(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium capitalize">{category}</span>
                          <Badge className={rules.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                            {rules.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          {rules.autoProcessingEnabled && (
                            <Badge className="bg-blue-100 text-blue-700">Auto Processing</Badge>
                          )}
                        </div>
                        {expandedCategories.has(category) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    {expandedCategories.has(category) && (
                      <div className="px-4 pb-4 space-y-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center justify-between">
                            <Label>Category Enabled</Label>
                            <Switch
                              checked={rules.enabled}
                              onCheckedChange={(checked) => 
                                updateConfiguration(['categoryRules', category, 'enabled'], checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label>Auto Processing</Label>
                            <Switch
                              checked={rules.autoProcessingEnabled}
                              onCheckedChange={(checked) => 
                                updateConfiguration(['categoryRules', category, 'autoProcessingEnabled'], checked)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Confidence Adjustment (%)</Label>
                            <div className="flex items-center gap-2 mt-2">
                              <Slider
                                value={[rules.confidenceAdjustment]}
                                onValueChange={(values) => 
                                  updateConfiguration(['categoryRules', category, 'confidenceAdjustment'], values[0])
                                }
                                min={-20}
                                max={20}
                                step={1}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium w-12">
                                {rules.confidenceAdjustment > 0 ? '+' : ''}{rules.confidenceAdjustment}
                              </span>
                            </div>
                          </div>

                          <div>
                            <Label>Priority Adjustment</Label>
                            <div className="flex items-center gap-2 mt-2">
                              <Slider
                                value={[rules.priorityAdjustment]}
                                onValueChange={(values) => 
                                  updateConfiguration(['categoryRules', category, 'priorityAdjustment'], values[0])
                                }
                                min={-20}
                                max={20}
                                step={1}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium w-12">
                                {rules.priorityAdjustment > 0 ? '+' : ''}{rules.priorityAdjustment}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Special Requirements</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {rules.specialRequirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 flex items-center gap-2"
                            onClick={() => {
                              const newReq = prompt('Enter special requirement:');
                              if (newReq) {
                                const updatedReqs = [...rules.specialRequirements, newReq];
                                updateConfiguration(['categoryRules', category, 'specialRequirements'], updatedReqs);
                              }
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            Add Requirement
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Caching Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Caching Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-caching">Enable Caching</Label>
                  <Switch
                    id="enable-caching"
                    checked={configuration.performance.enableCaching}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['performance', 'enableCaching'], checked)
                    }
                  />
                </div>

                {configuration.performance.enableCaching && (
                  <div>
                    <Label>Cache Expiry (minutes)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={1440}
                      value={configuration.performance.cacheExpiryMinutes}
                      onChange={(e) => 
                        updateConfiguration(
                          ['performance', 'cacheExpiryMinutes'], 
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processing Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-green-500" />
                  Processing Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-preprocessing">Enable Preprocessing</Label>
                  <Switch
                    id="enable-preprocessing"
                    checked={configuration.performance.enablePreprocessing}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['performance', 'enablePreprocessing'], checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="parallel-processing">Parallel Processing</Label>
                  <Switch
                    id="parallel-processing"
                    checked={configuration.performance.parallelProcessingEnabled}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['performance', 'parallelProcessingEnabled'], checked)
                    }
                  />
                </div>

                {configuration.performance.parallelProcessingEnabled && (
                  <div>
                    <Label>Max Concurrent Processing</Label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={configuration.performance.maxConcurrentProcessing}
                      onChange={(e) => 
                        updateConfiguration(
                          ['performance', 'maxConcurrentProcessing'], 
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Audit Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Audit & Logging Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="log-decisions">Log All Decisions</Label>
                  <Switch
                    id="log-decisions"
                    checked={configuration.auditSettings.logAllDecisions}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['auditSettings', 'logAllDecisions'], checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-metrics">Performance Metrics</Label>
                  <Switch
                    id="enable-metrics"
                    checked={configuration.auditSettings.enablePerformanceMetrics}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['auditSettings', 'enablePerformanceMetrics'], checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="accuracy-tracking">Accuracy Tracking</Label>
                  <Switch
                    id="accuracy-tracking"
                    checked={configuration.auditSettings.enableAccuracyTracking}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['auditSettings', 'enableAccuracyTracking'], checked)
                    }
                  />
                </div>

                <div>
                  <Label>Retain Logs (months)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={configuration.auditSettings.retainLogsMonths}
                    onChange={(e) => 
                      updateConfiguration(
                        ['auditSettings', 'retainLogsMonths'], 
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alert Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Alert Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-alerts">Admin Alerts</Label>
                  <Switch
                    id="admin-alerts"
                    checked={configuration.notifications.adminAlerts}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['notifications', 'adminAlerts'], checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="business-notifications">Business Owner Notifications</Label>
                  <Switch
                    id="business-notifications"
                    checked={configuration.notifications.businessOwnerNotifications}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['notifications', 'businessOwnerNotifications'], checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Escalation Thresholds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  Escalation Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Queue Size Threshold</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    value={configuration.notifications.escalationThresholds.queueSize}
                    onChange={(e) => 
                      updateConfiguration(
                        ['notifications', 'escalationThresholds', 'queueSize'], 
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Oldest Pending (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={configuration.notifications.escalationThresholds.oldestPendingDays}
                    onChange={(e) => 
                      updateConfiguration(
                        ['notifications', 'escalationThresholds', 'oldestPendingDays'], 
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Low Confidence Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={configuration.notifications.escalationThresholds.lowConfidenceCount}
                    onChange={(e) => 
                      updateConfiguration(
                        ['notifications', 'escalationThresholds', 'lowConfidenceCount'], 
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core System Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  Core System Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-enabled">AI System Enabled</Label>
                    <p className="text-xs text-gray-600">Master control for the entire AI system</p>
                  </div>
                  <Switch
                    id="system-enabled"
                    checked={configuration.systemEnabled}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['systemEnabled'], checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-xs text-gray-600">Pauses all AI processing</p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={configuration.maintenanceMode}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['maintenanceMode'], checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="process-new">Process New Submissions</Label>
                    <p className="text-xs text-gray-600">Allow processing of new business submissions</p>
                  </div>
                  <Switch
                    id="process-new"
                    checked={configuration.processNewSubmissions}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['processNewSubmissions'], checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="batch-enabled">Batch Processing</Label>
                    <p className="text-xs text-gray-600">Enable automated batch operations</p>
                  </div>
                  <Switch
                    id="batch-enabled"
                    checked={configuration.batchProcessingEnabled}
                    onCheckedChange={(checked) => 
                      updateConfiguration(['batchProcessingEnabled'], checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Configuration Version</span>
                  <Badge variant="outline">{configuration.version}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Modified</span>
                  <span className="text-sm">{new Date(configuration.lastModified).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Modified By</span>
                  <span className="text-sm">{configuration.modifiedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Applied At</span>
                  <span className="text-sm">
                    {configuration.appliedAt ? new Date(configuration.appliedAt).toLocaleString() : 'Not applied'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Save Configuration Dialog Component
function SaveConfigurationDialog({ 
  onSave, 
  testMode 
}: { 
  onSave: (reason: string) => void; 
  testMode: boolean;
}) {
  const [reason, setReason] = useState('');
  const [saveAndApply, setSaveAndApply] = useState(!testMode);

  const handleSave = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for the configuration changes');
      return;
    }
    onSave(reason);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="change-reason">Change Reason *</Label>
        <Textarea
          id="change-reason"
          placeholder="Describe the reason for these configuration changes..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-2"
          rows={3}
        />
      </div>

      {testMode && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Test Mode Active</AlertTitle>
          <AlertDescription>
            Changes will be validated but not applied immediately. You can review and apply them later.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="save-and-apply"
          checked={saveAndApply}
          onCheckedChange={setSaveAndApply}
          disabled={testMode}
        />
        <Label htmlFor="save-and-apply" className="text-sm">
          Save and apply immediately {testMode && '(disabled in test mode)'}
        </Label>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => {}}>Cancel</Button>
        <Button onClick={handleSave}>
          {testMode ? 'Validate Changes' : saveAndApply ? 'Save & Apply' : 'Save Configuration'}
        </Button>
      </DialogFooter>
    </div>
  );
}