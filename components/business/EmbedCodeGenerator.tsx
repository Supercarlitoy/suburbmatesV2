'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Code, CheckCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmbedCodeGeneratorProps {
  businessName: string;
  businessSlug: string;
  className?: string;
}

type EmbedType = 'iframe' | 'widget' | 'card';
type EmbedSize = 'small' | 'medium' | 'large' | 'custom';

interface EmbedConfig {
  type: EmbedType;
  size: EmbedSize;
  width: number;
  height: number;
  showBranding: boolean;
}

export default function EmbedCodeGenerator({ 
  businessName, 
  businessSlug, 
  className 
}: EmbedCodeGeneratorProps) {
  const [config, setConfig] = useState<EmbedConfig>({
    type: 'card',
    size: 'medium',
    width: 400,
    height: 300,
    showBranding: true,
  });
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');

  // Generate the base URLs
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://suburbmates.com.au' 
    : 'http://localhost:3000';
  
  const embedUrl = `${baseUrl}/business/${businessSlug}/embed?utm_source=embed&utm_medium=website`;

  // Size presets
  const sizePresets = {
    small: { width: 300, height: 200 },
    medium: { width: 400, height: 300 },
    large: { width: 600, height: 450 },
    custom: { width: config.width, height: config.height },
  };

  // Update dimensions when size changes
  useEffect(() => {
    if (config.size !== 'custom') {
      const preset = sizePresets[config.size];
      setConfig(prev => ({ ...prev, width: preset.width, height: preset.height }));
    }
  }, [config.size]);

  // Generate embed code based on type
  const generateEmbedCode = () => {
    const { width, height, showBranding } = config;
    const params = new URLSearchParams({
      utm_source: 'embed',
      utm_medium: 'website',
      ...(showBranding ? {} : { branding: 'minimal' }),
    });

    switch (config.type) {
      case 'iframe':
        return `<iframe 
  src="${embedUrl}&${params.toString()}"
  width="${width}"
  height="${height}"
  frameborder="0"
  scrolling="no"
  title="${businessName} - Business Profile"
  loading="lazy"
></iframe>`;

      case 'widget':
        return `<!-- SuburbMates Business Widget -->
<div id="suburbmates-widget-${businessSlug}" style="width: ${width}px; height: ${height}px;">
  <script>
    (function() {
      var iframe = document.createElement('iframe');
      iframe.src = '${embedUrl}&${params.toString()}';
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.title = '${businessName} - Business Profile';
      iframe.loading = 'lazy';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      document.getElementById('suburbmates-widget-${businessSlug}').appendChild(iframe);
    })();
  </script>
</div>`;

      case 'card':
      default:
        return `<!-- SuburbMates Business Card -->
<div class="suburbmates-business-card" style="
  width: ${width}px;
  height: ${height}px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-family: system-ui, sans-serif;
">
  <iframe 
    src="${embedUrl}&${params.toString()}"
    width="100%"
    height="100%"
    frameborder="0"
    scrolling="no"
    title="${businessName} - Business Profile"
    loading="lazy"
    style="border: none;"
  ></iframe>
</div>`;
    }
  };

  const embedCode = generateEmbedCode();

  // Handle code copy
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy embed code:', err);
    }
  };

  // Reset copy state when code changes
  useEffect(() => {
    setCopied(false);
  }, [embedCode]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Embed Code Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate embed code for {businessName} profile
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Options */}
        <div className="grid grid-cols-2 gap-4">
          {/* Embed Type */}
          <div className="space-y-2">
            <Label htmlFor="embed-type">Embed Type</Label>
            <Select
              value={config.type}
              onValueChange={(value: EmbedType) => 
                setConfig(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Styled Card</SelectItem>
                <SelectItem value="iframe">Simple iframe</SelectItem>
                <SelectItem value="widget">JavaScript Widget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size Preset */}
          <div className="space-y-2">
            <Label htmlFor="embed-size">Size</Label>
            <Select
              value={config.size}
              onValueChange={(value: EmbedSize) => 
                setConfig(prev => ({ ...prev, size: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (300×200)</SelectItem>
                <SelectItem value="medium">Medium (400×300)</SelectItem>
                <SelectItem value="large">Large (600×450)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Dimensions */}
          {config.size === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="embed-width">Width (px)</Label>
                <input
                  id="embed-width"
                  type="number"
                  min="200"
                  max="1200"
                  value={config.width}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    width: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="embed-height">Height (px)</Label>
                <input
                  id="embed-height"
                  type="number"
                  min="150"
                  max="800"
                  value={config.height}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    height: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                />
              </div>
            </>
          )}
        </div>

        {/* Options */}
        <div className="flex items-center space-x-2">
          <input
            id="show-branding"
            type="checkbox"
            checked={config.showBranding}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              showBranding: e.target.checked
            }))}
            className="rounded border-input"
          />
          <Label htmlFor="show-branding" className="text-sm">
            Show SuburbMates branding
          </Label>
        </div>

        {/* Preview/Code Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={previewMode === 'code' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('code')}
          >
            <Code className="h-4 w-4 mr-1" />
            Code
          </Button>
          <Button
            variant={previewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('preview')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>

        {/* Code or Preview Display */}
        {previewMode === 'code' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="embed-code">Embed Code</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCode}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="embed-code"
              value={embedCode}
              readOnly
              className="font-mono text-xs h-32 resize-none"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div 
              className="border rounded-lg p-4 bg-gray-50"
              style={{ minHeight: config.height + 40 }}
            >
              <div 
                style={{ 
                  width: config.width, 
                  height: config.height,
                  margin: '0 auto'
                }}
                dangerouslySetInnerHTML={{ __html: embedCode }}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">How to use:</p>
          <ul className="space-y-1 ml-2">
            <li>• Copy the embed code above</li>
            <li>• Paste it into your website's HTML</li>
            <li>• The embed will load automatically</li>
            <li>• Includes conversion tracking</li>
          </ul>
          <p className="mt-2">
            <strong>Note:</strong> Make sure your website allows iframes from suburbmates.com.au
          </p>
        </div>
      </CardContent>
    </Card>
  );
}