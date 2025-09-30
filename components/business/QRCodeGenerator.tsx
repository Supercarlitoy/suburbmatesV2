'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Copy, Link, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRCodeGeneratorProps {
  businessName: string;
  businessSlug: string;
  className?: string;
}

export default function QRCodeGenerator({ 
  businessName, 
  businessSlug, 
  className 
}: QRCodeGeneratorProps) {
  const [qrSize, setQrSize] = useState(256);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  
  // Generate the full business profile URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://suburbmates.com.au' 
    : 'http://localhost:3000';
  const profileUrl = `${baseUrl}/business/${businessSlug}`;
  const shareUrl = `${profileUrl}/share?utm_source=qr_code&utm_medium=offline&utm_campaign=qr_share`;

  // Handle QR code download
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = qrSize;
    canvas.height = qrSize;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${businessSlug}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Handle URL copy
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Reset copy state when URL changes
  useEffect(() => {
    setCopied(false);
  }, [shareUrl]);

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          QR Code Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate a QR code for {businessName} profile
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center p-4 bg-white rounded-lg border">
          <QRCodeSVG
            id="qr-code-svg"
            value={shareUrl}
            size={qrSize}
            level="M"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>

        {/* Size Control */}
        <div className="space-y-2">
          <Label htmlFor="qr-size">QR Code Size</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="qr-size"
              type="range"
              min="128"
              max="512"
              step="64"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-16">
              {qrSize}px
            </span>
          </div>
        </div>

        {/* URL Display */}
        <div className="space-y-2">
          <Label htmlFor="share-url">Share URL</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="share-url"
              value={shareUrl}
              readOnly
              className="flex-1 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyUrl}
              disabled={copied}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-green-600">URL copied to clipboard!</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={downloadQRCode}
            className="flex-1"
            disabled={downloaded}
          >
            {downloaded ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Downloaded
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </>
            )}
          </Button>
        </div>

        {/* Usage Instructions */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">How to use:</p>
          <ul className="space-y-1 ml-2">
            <li>• Print on business cards or flyers</li>
            <li>• Display in store windows</li>
            <li>• Include in marketing materials</li>
            <li>• Share on social media posts</li>
          </ul>
          <p className="mt-2">
            The QR code includes tracking parameters to measure offline-to-online conversions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}