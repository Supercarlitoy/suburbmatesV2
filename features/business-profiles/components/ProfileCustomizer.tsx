"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Layout, 
  Eye, 
  Settings,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";
import { 
  PROFILE_THEMES, 
  LAYOUT_OPTIONS, 
  getThemeById,
  getLayoutById,
  getRecommendedThemes,
  type ProfileTheme,
  type LayoutOption,
  type CustomizationOptions
} from "@/lib/constants/profile-themes";
import { cn } from "@/lib/utils";

interface ProfileCustomizerProps {
  businessCategory?: string;
  currentOptions: CustomizationOptions;
  onChange: (options: CustomizationOptions) => void;
  onPreview?: () => void;
  className?: string;
}

export function ProfileCustomizer({
  businessCategory,
  currentOptions,
  onChange,
  onPreview,
  className
}: ProfileCustomizerProps) {
  const [previewDevice, setPreviewDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const recommendedThemes = businessCategory ? getRecommendedThemes(businessCategory) : [];
  const currentTheme = getThemeById(currentOptions.theme);
  const currentLayout = getLayoutById(currentOptions.layout);

  const updateOptions = (updates: Partial<CustomizationOptions>) => {
    onChange({ ...currentOptions, ...updates });
  };

  const ThemeCard = ({ theme, isSelected, isRecommended }: { 
    theme: ProfileTheme; 
    isSelected: boolean; 
    isRecommended?: boolean;
  }) => (
    <div
      className={cn(
        "relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
      onClick={() => updateOptions({ theme: theme.id })}
    >
      {isRecommended && (
        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs">
          Recommended
        </Badge>
      )}
      
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div className="flex-1">
          <div className="font-medium text-sm">{theme.name}</div>
          <div className="text-xs text-muted-foreground">{theme.description}</div>
        </div>
        <span className="text-lg">{theme.preview}</span>
      </div>
      
      {/* Color palette preview */}
      <div className="flex gap-1">
        {Object.entries(theme.colors).slice(0, 4).map(([key, color]) => (
          <div
            key={key}
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: color }}
            title={key}
          />
        ))}
      </div>
    </div>
  );

  const LayoutCard = ({ layout, isSelected }: { 
    layout: LayoutOption; 
    isSelected: boolean;
  }) => (
    <div
      className={cn(
        "p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
      onClick={() => updateOptions({ layout: layout.id })}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{layout.preview}</span>
        <div className="flex-1">
          <div className="font-medium">{layout.name}</div>
          <div className="text-sm text-muted-foreground">{layout.description}</div>
        </div>
      </div>
      
      <div className="space-y-1">
        {layout.features.slice(0, 3).map((feature, index) => (
          <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
            <div className="w-1 h-1 bg-primary rounded-full" />
            {feature}
          </div>
        ))}
        {layout.features.length > 3 && (
          <div className="text-xs text-muted-foreground">+{layout.features.length - 3} more</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profile Customization</h3>
          <p className="text-sm text-muted-foreground">
            Personalize your business profile to match your brand
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Device Preview Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewDevice('desktop')}
              className="h-8 w-8 p-0"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewDevice('tablet')}
              className="h-8 w-8 p-0"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewDevice('mobile')}
              className="h-8 w-8 p-0"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          
          {onPreview && (
            <Button onClick={onPreview} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Social
          </TabsTrigger>
        </TabsList>

        {/* Theme Selection */}
        <TabsContent value="theme" className="space-y-4">
          {recommendedThemes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended for {businessCategory}</CardTitle>
                <CardDescription>
                  Themes that work well for your business category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedThemes.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isSelected={currentOptions.theme === theme.id}
                      isRecommended
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Themes</CardTitle>
              <CardDescription>
                Choose from our complete collection of professional themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROFILE_THEMES.filter(theme => 
                  !recommendedThemes.some(rec => rec.id === theme.id)
                ).map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isSelected={currentOptions.theme === theme.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Selection */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Layout</CardTitle>
              <CardDescription>
                Choose how your business information is organized and displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LAYOUT_OPTIONS.map((layout) => (
                  <LayoutCard
                    key={layout.id}
                    layout={layout}
                    isSelected={currentOptions.layout === layout.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Settings */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Settings</CardTitle>
              <CardDescription>
                Control what sections appear on your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Show Testimonials</Label>
                    <p className="text-sm text-muted-foreground">Display customer reviews and testimonials</p>
                  </div>
                  <Switch
                    checked={currentOptions.showTestimonials}
                    onCheckedChange={(checked) => updateOptions({ showTestimonials: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Show Gallery</Label>
                    <p className="text-sm text-muted-foreground">Display business photos and portfolio</p>
                  </div>
                  <Switch
                    checked={currentOptions.showGallery}
                    onCheckedChange={(checked) => updateOptions({ showGallery: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Show Business Hours</Label>
                    <p className="text-sm text-muted-foreground">Display operating hours and availability</p>
                  </div>
                  <Switch
                    checked={currentOptions.showBusinessHours}
                    onCheckedChange={(checked) => updateOptions({ showBusinessHours: checked })}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* CTA Customization */}
              <div className="space-y-4">
                <Label className="font-medium">Call-to-Action Button</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta-text" className="text-sm">Button Text</Label>
                    <Input
                      id="cta-text"
                      value={currentOptions.ctaText}
                      onChange={(e) => updateOptions({ ctaText: e.target.value })}
                      placeholder="Get Quote"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Button Style</Label>
                    <div className="flex gap-2">
                      {['button', 'banner', 'floating'].map((style) => (
                        <Button
                          key={style}
                          variant={currentOptions.ctaStyle === style ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateOptions({ ctaStyle: style as any })}
                          className="capitalize"
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social Media Links</CardTitle>
              <CardDescription>
                Add your social media profiles to increase engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={currentOptions.socialLinks.facebook || ''}
                    onChange={(e) => updateOptions({ 
                      socialLinks: { ...currentOptions.socialLinks, facebook: e.target.value }
                    })}
                    placeholder="https://facebook.com/yourbusiness"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={currentOptions.socialLinks.instagram || ''}
                    onChange={(e) => updateOptions({ 
                      socialLinks: { ...currentOptions.socialLinks, instagram: e.target.value }
                    })}
                    placeholder="https://instagram.com/yourbusiness"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={currentOptions.socialLinks.linkedin || ''}
                    onChange={(e) => updateOptions({ 
                      socialLinks: { ...currentOptions.socialLinks, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/company/yourbusiness"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={currentOptions.socialLinks.website || ''}
                    onChange={(e) => updateOptions({ 
                      socialLinks: { ...currentOptions.socialLinks, website: e.target.value }
                    })}
                    placeholder="https://yourbusiness.com.au"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Current Selection Summary */}
      {(currentTheme || currentLayout) && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Current Selection</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {currentTheme && (
                    <span className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      />
                      {currentTheme.name}
                    </span>
                  )}
                  {currentLayout && (
                    <span className="flex items-center gap-2">
                      <span>{currentLayout.preview}</span>
                      {currentLayout.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProfileCustomizer;