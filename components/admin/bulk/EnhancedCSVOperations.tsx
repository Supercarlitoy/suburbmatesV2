"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { 
  Upload,
  Download,
  FileText,
  File,
  FileSpreadsheet,
  FileJson,
  FileX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Clock,
  Play,
  Pause,
  Square,
  RefreshCw,
  Settings,
  Filter,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Send,
  Database,
  Target,
  Zap,
  Activity,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Gauge,
  MousePointer,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Link2,
  Unlink,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced interfaces for Task #7 Phase 4
interface CSVOperation {
  id: string;
  name: string;
  type: 'IMPORT' | 'EXPORT' | 'UPDATE' | 'SYNC';
  status: 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  entityType: 'BUSINESSES' | 'USERS' | 'LEADS' | 'CUSTOM';
  
  // File information
  fileName: string;
  fileFormat: 'CSV' | 'JSON' | 'XML' | 'EXCEL';
  fileSize: number;
  uploadedAt: string;
  processedAt?: string;
  
  // Processing details
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  errorRows: number;
  skippedRows: number;
  
  // Configuration
  config: {
    hasHeader: boolean;
    delimiter: ',' | ';' | '\t' | '|';
    encoding: 'UTF-8' | 'ISO-8859-1' | 'Windows-1252';
    dateFormat: string;
    skipEmptyRows: boolean;
    validateData: boolean;
    duplicateHandling: 'SKIP' | 'UPDATE' | 'CREATE_NEW';
    batchSize: number;
    updateMode: 'FULL_REPLACE' | 'INCREMENTAL' | 'MERGE';
  };
  
  // Field mapping
  fieldMapping: {
    sourceField: string;
    targetField: string;
    transformation?: 'UPPERCASE' | 'LOWERCASE' | 'TRIM' | 'PHONE_FORMAT' | 'EMAIL_NORMALIZE' | 'DATE_PARSE';
    defaultValue?: string;
    required: boolean;
    validated: boolean;
    validationRules?: string[];
  }[];
  
  // Validation results
  validation: {
    isValid: boolean;
    errors: {
      row: number;
      field: string;
      error: string;
      severity: 'ERROR' | 'WARNING';
    }[];
    warnings: string[];
    suggestions: {
      type: 'FIELD_MAPPING' | 'DATA_FORMAT' | 'DUPLICATE_DETECTION' | 'VALIDATION_RULE';
      message: string;
      action?: string;
    }[];
  };
  
  // Scheduling
  schedule?: {
    enabled: boolean;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    cronExpression?: string;
    nextRun?: string;
    timezone: string;
  };
  
  // Export specific
  exportConfig?: {
    includeHeaders: boolean;
    selectedFields: string[];
    filterCriteria?: any[];
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    format: 'CSV' | 'EXCEL' | 'JSON' | 'XML';
    compression?: 'ZIP' | 'GZIP';
  };
  
  // Audit
  createdBy: string;
  createdAt: string;
  lastModified: string;
  auditLog: {
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }[];
}

interface DataPreview {
  headers: string[];
  rows: any[][];
  totalRows: number;
  sampleSize: number;
  dataTypes: {
    [key: string]: 'STRING' | 'NUMBER' | 'DATE' | 'EMAIL' | 'PHONE' | 'BOOLEAN' | 'URL';
  };
  statistics: {
    [key: string]: {
      nullCount: number;
      uniqueCount: number;
      mostCommon?: string;
      dataQuality: number;
    };
  };
}

interface FieldMappingInterface {
  sourceFields: string[];
  targetFields: {
    field: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  suggestedMappings: {
    sourceField: string;
    targetField: string;
    confidence: number;
    reason: string;
  }[];
}

interface EnhancedCSVOperationsProps {
  className?: string;
}

export default function EnhancedCSVOperations({ className }: EnhancedCSVOperationsProps) {
  // State management
  const [operations, setOperations] = useState<CSVOperation[]>([]);
  const [currentOperation, setCurrentOperation] = useState<Partial<CSVOperation> | null>(null);
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMappingInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('import');
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'mapping' | 'validation' | 'processing'>('upload');
  const [showOperationBuilder, setShowOperationBuilder] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showExportBuilder, setShowExportBuilder] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // File handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  
  // Form state for new operations
  const [newOperation, setNewOperation] = useState<Partial<CSVOperation>>({
    type: 'IMPORT',
    entityType: 'BUSINESSES',
    config: {
      hasHeader: true,
      delimiter: ',',
      encoding: 'UTF-8',
      dateFormat: 'YYYY-MM-DD',
      skipEmptyRows: true,
      validateData: true,
      duplicateHandling: 'SKIP',
      batchSize: 100,
      updateMode: 'INCREMENTAL'
    }
  });

  // Filter operations
  const filteredOperations = useMemo(() => {
    let filtered = operations;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(op => 
        op.name.toLowerCase().includes(query) ||
        op.fileName.toLowerCase().includes(query) ||
        op.entityType.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(op => op.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(op => op.type === typeFilter);
    }
    
    if (entityFilter !== 'all') {
      filtered = filtered.filter(op => op.entityType === entityFilter);
    }
    
    return filtered;
  }, [operations, searchQuery, statusFilter, typeFilter, entityFilter]);

  // Load operations
  const fetchOperations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/csv-operations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations || []);
      }
    } catch (error) {
      console.error('Error fetching CSV operations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  // File upload handling
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    const supportedTypes = ['text/csv', 'application/json', 'text/xml', 'application/xml', 
                           'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!supportedTypes.some(type => file.type.includes(type.split('/')[1]) || file.name.toLowerCase().endsWith(`.${type.split('/')[1]}`))) {
      alert('Unsupported file format. Please select CSV, JSON, XML, or Excel files.');
      return;
    }

    setSelectedFile(file);
    setCurrentOperation({
      ...newOperation,
      fileName: file.name,
      fileFormat: getFileFormat(file.name),
      fileSize: file.size
    });

    // Move to preview step
    setCurrentStep('preview');
    
    // Process file for preview
    await processFilePreview(file);
  };

  const getFileFormat = (fileName: string): CSVOperation['fileFormat'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'json': return 'JSON';
      case 'xml': return 'XML';
      case 'xlsx': case 'xls': return 'EXCEL';
      default: return 'CSV';
    }
  };

  const processFilePreview = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('preview_only', 'true');
      
      const response = await fetch('/api/admin/csv-operations/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const preview = await response.json();
        setDataPreview(preview);
        
        // Auto-generate field mapping suggestions
        await generateFieldMapping(preview.headers);
      }
    } catch (error) {
      console.error('Error processing file preview:', error);
    } finally {
      setUploading(false);
    }
  };

  const generateFieldMapping = async (sourceFields: string[]) => {
    try {
      const response = await fetch('/api/admin/csv-operations/field-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
        body: JSON.stringify({
          sourceFields,
          entityType: currentOperation?.entityType
        }),
      });

      if (response.ok) {
        const mapping = await response.json();
        setFieldMapping(mapping);
      }
    } catch (error) {
      console.error('Error generating field mapping:', error);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Process import operation
  const executeImportOperation = async () => {
    if (!selectedFile || !currentOperation) return;

    setCurrentStep('processing');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('operation_config', JSON.stringify(currentOperation));

      const response = await fetch('/api/admin/csv-operations/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        await fetchOperations();
        resetOperation();
      }
    } catch (error) {
      console.error('Error executing import operation:', error);
    }
  };

  const resetOperation = () => {
    setCurrentOperation(null);
    setSelectedFile(null);
    setDataPreview(null);
    setFieldMapping(null);
    setCurrentStep('upload');
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    return {
      totalOperations: operations.length,
      completedOperations: operations.filter(op => op.status === 'COMPLETED').length,
      failedOperations: operations.filter(op => op.status === 'FAILED').length,
      processingOperations: operations.filter(op => op.status === 'PROCESSING').length,
      scheduledOperations: operations.filter(op => op.status === 'SCHEDULED').length,
      totalRowsProcessed: operations.reduce((sum, op) => sum + op.processedRows, 0),
      totalImports: operations.filter(op => op.type === 'IMPORT').length,
      totalExports: operations.filter(op => op.type === 'EXPORT').length
    };
  }, [operations]);

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading CSV operations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced CSV Operations</h1>
            <p className="text-gray-600">
              Advanced import/export with drag-drop, validation, field mapping, scheduling, and multi-format support
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={fetchOperations}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowExportBuilder(true)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button 
              onClick={() => setActiveTab('import')}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Operations</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summaryMetrics.totalOperations}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summaryMetrics.completedOperations}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summaryMetrics.processingOperations}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summaryMetrics.scheduledOperations}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summaryMetrics.failedOperations}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rows Processed</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {summaryMetrics.totalRowsProcessed.toLocaleString()}
                  </p>
                </div>
                <Database className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Imports</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {summaryMetrics.totalImports}
                  </p>
                </div>
                <Upload className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Exports</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {summaryMetrics.totalExports}
                  </p>
                </div>
                <Download className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        {/* Import Data Tab */}
        <TabsContent value="import" className="space-y-6">
          {currentStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Data File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Drag & Drop Upload Area */}
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="mx-auto max-w-md">
                      <div className="flex justify-center space-x-4 mb-4">
                        <FileSpreadsheet className="h-12 w-12 text-green-500" />
                        <FileJson className="h-12 w-12 text-blue-500" />
                        <FileX className="h-12 w-12 text-orange-500" />
                        <File className="h-12 w-12 text-gray-500" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drag & drop files here or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supports CSV, Excel, JSON, and XML files up to 50MB
                      </p>
                      <Button onClick={handleFileInputClick}>
                        <Upload className="h-4 w-4 mr-2" />
                        Select Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,.json,.xml"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Configuration Options */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Import Settings</h3>
                      
                      <div>
                        <Label>Entity Type</Label>
                        <Select value={newOperation.entityType} onValueChange={(value) => 
                          setNewOperation({...newOperation, entityType: value as any})
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BUSINESSES">Businesses</SelectItem>
                            <SelectItem value="USERS">Users</SelectItem>
                            <SelectItem value="LEADS">Leads</SelectItem>
                            <SelectItem value="CUSTOM">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Duplicate Handling</Label>
                        <Select value={newOperation.config?.duplicateHandling} onValueChange={(value) => 
                          setNewOperation({
                            ...newOperation, 
                            config: {...newOperation.config!, duplicateHandling: value as any}
                          })
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SKIP">Skip Duplicates</SelectItem>
                            <SelectItem value="UPDATE">Update Existing</SelectItem>
                            <SelectItem value="CREATE_NEW">Create New</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={newOperation.config?.validateData}
                          onCheckedChange={(checked) => 
                            setNewOperation({
                              ...newOperation, 
                              config: {...newOperation.config!, validateData: !!checked}
                            })
                          }
                        />
                        <Label>Validate data during import</Label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">File Format</h3>
                      
                      <div>
                        <Label>Field Delimiter</Label>
                        <Select value={newOperation.config?.delimiter} onValueChange={(value) => 
                          setNewOperation({
                            ...newOperation, 
                            config: {...newOperation.config!, delimiter: value as any}
                          })
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=",">Comma (,)</SelectItem>
                            <SelectItem value=";">Semicolon (;)</SelectItem>
                            <SelectItem value="\t">Tab</SelectItem>
                            <SelectItem value="|">Pipe (|)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Text Encoding</Label>
                        <Select value={newOperation.config?.encoding} onValueChange={(value) => 
                          setNewOperation({
                            ...newOperation, 
                            config: {...newOperation.config!, encoding: value as any}
                          })
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTF-8">UTF-8</SelectItem>
                            <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
                            <SelectItem value="Windows-1252">Windows-1252</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={newOperation.config?.hasHeader}
                          onCheckedChange={(checked) => 
                            setNewOperation({
                              ...newOperation, 
                              config: {...newOperation.config!, hasHeader: !!checked}
                            })
                          }
                        />
                        <Label>First row contains headers</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'preview' && dataPreview && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Data Preview ({dataPreview.totalRows.toLocaleString()} rows)
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={resetOperation}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep('mapping')}>
                      Field Mapping
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Data Quality Summary */}
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{dataPreview.headers.length}</p>
                      <p className="text-sm text-gray-600">Columns</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{dataPreview.totalRows.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Rows</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {Object.values(dataPreview.statistics).reduce((sum, stat) => sum + stat.nullCount, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Null Values</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round(Object.values(dataPreview.statistics).reduce((sum, stat) => sum + stat.dataQuality, 0) / Object.keys(dataPreview.statistics).length)}%
                      </p>
                      <p className="text-sm text-gray-600">Data Quality</p>
                    </div>
                  </div>

                  {/* Column Analysis */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Column Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {dataPreview.headers.map((header, index) => {
                        const stats = dataPreview.statistics[header];
                        const dataType = dataPreview.dataTypes[header];
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{header}</h4>
                              <Badge variant="outline">{dataType}</Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Unique values:</span>
                                <span>{stats.uniqueCount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Null values:</span>
                                <span>{stats.nullCount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Data quality:</span>
                                <span className={cn(
                                  "font-medium",
                                  stats.dataQuality >= 80 ? "text-green-600" :
                                  stats.dataQuality >= 60 ? "text-orange-600" : "text-red-600"
                                )}>
                                  {stats.dataQuality}%
                                </span>
                              </div>
                              {stats.mostCommon && (
                                <div className="flex justify-between">
                                  <span>Most common:</span>
                                  <span className="truncate max-w-24" title={stats.mostCommon}>
                                    {stats.mostCommon}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Data Sample */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Data Sample (First 10 rows)</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {dataPreview.headers.map((header, index) => (
                              <TableHead key={index}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dataPreview.rows.slice(0, 10).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex} className="max-w-32 truncate">
                                  {cell || <span className="text-gray-400">null</span>}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'mapping' && fieldMapping && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Field Mapping
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => setCurrentStep('preview')}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep('validation')}>
                      Validate
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-sm text-gray-600">
                    Map your source file columns to target database fields. Suggested mappings are highlighted.
                  </div>

                  <div className="space-y-4">
                    {fieldMapping.targetFields.map((targetField, index) => {
                      const suggestedMapping = fieldMapping.suggestedMappings.find(m => m.targetField === targetField.field);
                      return (
                        <div key={index} className={cn(
                          "flex items-center space-x-4 p-4 border rounded-lg",
                          suggestedMapping && suggestedMapping.confidence > 0.8 ? "border-green-200 bg-green-50" : "border-gray-200"
                        )}>
                          <div className="flex-1">
                            <div className="font-medium">{targetField.field}</div>
                            <div className="text-sm text-gray-500">{targetField.description}</div>
                            {targetField.required && (
                              <Badge variant="destructive" className="mt-1 text-xs">Required</Badge>
                            )}
                          </div>
                          <ArrowUpDown className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <Select defaultValue={suggestedMapping?.sourceField}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select source field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No mapping</SelectItem>
                                {fieldMapping.sourceFields.map((sourceField) => (
                                  <SelectItem key={sourceField} value={sourceField}>
                                    {sourceField}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {suggestedMapping && suggestedMapping.confidence > 0.8 && (
                              <div className="text-xs text-green-600 mt-1">
                                Suggested ({Math.round(suggestedMapping.confidence * 100)}% confidence)
                              </div>
                            )}
                          </div>
                          <div className="w-32">
                            <Select>
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Transform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No transformation</SelectItem>
                                <SelectItem value="UPPERCASE">UPPERCASE</SelectItem>
                                <SelectItem value="LOWERCASE">lowercase</SelectItem>
                                <SelectItem value="TRIM">Trim spaces</SelectItem>
                                <SelectItem value="PHONE_FORMAT">Format phone</SelectItem>
                                <SelectItem value="EMAIL_NORMALIZE">Normalize email</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {fieldMapping.suggestedMappings.filter(m => m.confidence > 0.8).length} of {fieldMapping.targetFields.length} fields auto-mapped
                    </div>
                    <Button variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      Save Mapping Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(currentStep === 'validation' || currentStep === 'processing') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentStep === 'validation' ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Data Validation
                    </>
                  ) : (
                    <>
                      <Activity className="h-5 w-5" />
                      Processing Import
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {currentStep === 'processing' && (
                    <div className="text-center py-8">
                      <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                      <p className="text-lg font-medium">Processing your data import...</p>
                      <p className="text-sm text-gray-600">This may take a few minutes for large files</p>
                    </div>
                  )}
                  
                  {currentStep === 'validation' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Ready to Import</h3>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" onClick={() => setCurrentStep('mapping')}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          <Button onClick={executeImportOperation}>
                            <Send className="h-4 w-4 mr-2" />
                            Start Import
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{dataPreview?.totalRows || 0}</p>
                          <p className="text-sm text-gray-600">Rows to Process</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{fieldMapping?.targetFields.length || 0}</p>
                          <p className="text-sm text-gray-600">Mapped Fields</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{currentOperation?.entityType}</p>
                          <p className="text-sm text-gray-600">Entity Type</p>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Import Settings Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Duplicate Handling: <span className="font-medium">{currentOperation?.config?.duplicateHandling}</span></div>
                          <div>Validation: <span className="font-medium">{currentOperation?.config?.validateData ? 'Enabled' : 'Disabled'}</span></div>
                          <div>Batch Size: <span className="font-medium">{currentOperation?.config?.batchSize} rows</span></div>
                          <div>File Format: <span className="font-medium">{currentOperation?.fileFormat}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search operations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="IMPORT">Import</SelectItem>
                    <SelectItem value="EXPORT">Export</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="SYNC">Sync</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Operations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                CSV Operations ({filteredOperations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOperations.map((operation) => (
                  <div key={operation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={
                            operation.status === 'COMPLETED' ? 'default' :
                            operation.status === 'PROCESSING' ? 'secondary' :
                            operation.status === 'FAILED' ? 'destructive' :
                            'outline'
                          }
                        >
                          {operation.status}
                        </Badge>
                        <Badge variant="outline">{operation.type}</Badge>
                        <Badge variant="secondary">{operation.entityType}</Badge>
                        <div>
                          <h4 className="font-semibold">{operation.name}</h4>
                          <p className="text-sm text-gray-600">{operation.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Results
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate Operation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Operation metrics */}
                    <div className="grid grid-cols-5 gap-4 text-center text-sm">
                      <div>
                        <p className="font-bold">{operation.totalRows.toLocaleString()}</p>
                        <p className="text-gray-500">Total</p>
                      </div>
                      <div>
                        <p className="font-bold text-green-600">{operation.successfulRows.toLocaleString()}</p>
                        <p className="text-gray-500">Success</p>
                      </div>
                      <div>
                        <p className="font-bold text-red-600">{operation.errorRows.toLocaleString()}</p>
                        <p className="text-gray-500">Errors</p>
                      </div>
                      <div>
                        <p className="font-bold text-orange-600">{operation.skippedRows.toLocaleString()}</p>
                        <p className="text-gray-500">Skipped</p>
                      </div>
                      <div>
                        <p className="font-bold text-blue-600">{(operation.fileSize / 1024 / 1024).toFixed(1)}MB</p>
                        <p className="text-gray-500">File Size</p>
                      </div>
                    </div>
                    
                    {/* Progress bar for processing operations */}
                    {operation.status === 'PROCESSING' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm text-gray-600">
                            {operation.totalRows > 0 ? 
                              ((operation.processedRows / operation.totalRows) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={operation.totalRows > 0 ? 
                            (operation.processedRows / operation.totalRows) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {filteredOperations.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No operations found</p>
                    <p className="text-sm text-gray-400">Start by importing or exporting some data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="export">
          <div className="text-center py-8">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Export Data</p>
            <p className="text-sm text-gray-400">Configure and export data in multiple formats</p>
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Scheduled Operations</p>
            <p className="text-sm text-gray-400">Manage automated import/export schedules</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs would be added here for export builder, etc. */}
    </div>
  );
}