import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Users,
  FileCheck,
  MessageSquare,
  Settings,
  BarChart3,
  Shield,
  Clock,
  Zap
} from 'lucide-react';

export default function AIAutomationPage() {
  // Mock data - in production, fetch from your database
  const aiStats = {
    claimsProcessed: 127,
    autoApproved: 89,
    autoRejected: 12,
    manualReview: 26,
    leadsQualified: 543,
    spamFiltered: 98,
    averageProcessingTime: '2.3 seconds',
    accuracyRate: 94.2,
  };

  const automationRules = [
    {
      id: 1,
      name: 'Business Verification',
      description: 'Auto-verify business claims using ABN, email, and web presence checks',
      status: 'active',
      threshold: 75,
      processed: 127,
      accuracy: 94.2,
    },
    {
      id: 2,
      name: 'Lead Qualification',
      description: 'Automatically score and prioritize customer inquiries',
      status: 'active',
      threshold: 60,
      processed: 543,
      accuracy: 91.8,
    },
    {
      id: 3,
      name: 'Content Moderation',
      description: 'Scan business descriptions for spam and inappropriate content',
      status: 'active',
      threshold: 80,
      processed: 234,
      accuracy: 97.1,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'claim_approved',
      message: 'AI auto-approved claim for "Melbourne Plumbing Services"',
      score: 89,
      time: '2 minutes ago',
    },
    {
      id: 2,
      type: 'lead_qualified',
      message: 'High-priority lead identified for "Garden Design Co"',
      score: 94,
      time: '5 minutes ago',
    },
    {
      id: 3,
      type: 'spam_detected',
      message: 'Spam inquiry automatically filtered',
      score: 87,
      time: '8 minutes ago',
    },
    {
      id: 4,
      type: 'manual_review',
      message: 'Claim for "Tech Solutions Ltd" requires manual review',
      score: 65,
      time: '12 minutes ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Automation</h1>
          <p className="text-gray-600 mt-2">
            Automated verification and quality control powered by AI
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Active
          </Badge>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* AI Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Claims Processed</p>
                <p className="text-2xl font-bold text-gray-900">{aiStats.claimsProcessed}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Auto-approved: {aiStats.autoApproved}</span>
                <span>{((aiStats.autoApproved / aiStats.claimsProcessed) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(aiStats.autoApproved / aiStats.claimsProcessed) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads Qualified</p>
                <p className="text-2xl font-bold text-gray-900">{aiStats.leadsQualified}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Spam filtered: {aiStats.spamFiltered}</span>
                <span>{((aiStats.spamFiltered / aiStats.leadsQualified) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(aiStats.spamFiltered / aiStats.leadsQualified) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">{aiStats.averageProcessingTime}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">67% faster than manual</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{aiStats.accuracyRate}%</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={aiStats.accuracyRate} className="h-2" />
              <p className="text-sm text-gray-600 mt-1">Target: 90%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              Automation Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {automationRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                  <Badge 
                    variant={rule.status === 'active' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {rule.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-500">Threshold</p>
                    <p className="font-medium">{rule.threshold}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Processed</p>
                    <p className="font-medium">{rule.processed}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Accuracy</p>
                    <p className="font-medium text-green-600">{rule.accuracy}%</p>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Manage Rules
            </Button>
          </CardContent>
        </Card>

        {/* Recent AI Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Recent AI Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'claim_approved' ? 'bg-green-500' :
                    activity.type === 'lead_qualified' ? 'bg-blue-500' :
                    activity.type === 'spam_detected' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.score}% confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="ghost" className="w-full mt-4">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            AI Configuration
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage AI automation thresholds and behavior
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="font-medium text-blue-900">Free AI Automation Active</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your SuburbMates platform is using cost-effective AI automation to:
                </p>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-blue-700 ml-7">
              <li>• Validate Australian Business Numbers (ABN) automatically</li>
              <li>• Verify business email domains and phone numbers</li>
              <li>• Analyze business descriptions for quality and legitimacy</li>
              <li>• Score and prioritize customer inquiries</li>
              <li>• Filter spam and low-quality leads automatically</li>
              <li>• Reduce manual verification workload by up to 70%</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Verification Thresholds</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Auto-approve claims above</span>
                  <Badge variant="outline">75%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Auto-reject claims below</span>
                  <Badge variant="outline">30%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mark leads as spam above</span>
                  <Badge variant="outline">60%</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Processing Options</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Real-time processing</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Email notifications</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Audit logging</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}