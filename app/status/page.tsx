import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Mail,
  Globe,
  Shield
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'System Status - SuburbMates',
  description: 'Real-time status of SuburbMates services and systems. Check if our platform is running smoothly.',
};

export default function StatusPage() {
  // In a real app, this would come from your monitoring service
  const systemStatus = {
    overall: 'operational', // operational, degraded, outage
    lastUpdated: new Date().toISOString(),
    uptime: '99.98%'
  };

  const services = [
    {
      name: 'Website & Platform',
      status: 'operational',
      description: 'Main website and business directory',
      icon: Globe,
      uptime: '99.99%',
      responseTime: '342ms'
    },
    {
      name: 'API Services',
      status: 'operational',
      description: 'Business search, registration, and profile APIs',
      icon: Server,
      uptime: '99.97%',
      responseTime: '189ms'
    },
    {
      name: 'Database',
      status: 'operational',
      description: 'Business profiles and user data storage',
      icon: Database,
      uptime: '100%',
      responseTime: '45ms'
    },
    {
      name: 'Email Service',
      status: 'operational',
      description: 'Notifications and communication emails',
      icon: Mail,
      uptime: '99.95%',
      responseTime: '1.2s'
    },
    {
      name: 'Authentication',
      status: 'operational',
      description: 'User login and security services',
      icon: Shield,
      uptime: '99.98%',
      responseTime: '156ms'
    },
    {
      name: 'Search & Discovery',
      status: 'operational',
      description: 'Business search and filtering',
      icon: Activity,
      uptime: '99.96%',
      responseTime: '278ms'
    }
  ];

  const incidents = [
    // In a real app, this would come from your incident management system
    {
      id: '1',
      title: 'Scheduled maintenance completed',
      status: 'resolved',
      severity: 'low',
      description: 'Routine database optimization and security updates completed successfully.',
      createdAt: '2024-01-15T02:00:00Z',
      resolvedAt: '2024-01-15T03:30:00Z',
      affectedServices: ['Database', 'API Services']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Degraded</Badge>;
      case 'outage':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Outage</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getIncidentSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="secondary" className="text-green-700">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'critical':
        return <Badge className="bg-red-600 text-white">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              SuburbMates
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            System Status
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Real-time status of SuburbMates services and infrastructure
          </p>
          
          {/* Overall Status */}
          <div className="max-w-md mx-auto mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  {getStatusIcon(systemStatus.overall)}
                  <h2 className="text-2xl font-bold">All Systems Operational</h2>
                </div>
                <p className="text-gray-600 mb-2">
                  Current uptime: <span className="font-semibold">{systemStatus.uptime}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(systemStatus.lastUpdated).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Service Status</h2>
            
            <div className="space-y-4">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-gray-100">
                          <service.icon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-gray-600 text-sm">{service.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Uptime</div>
                          <div className="font-semibold">{service.uptime}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Response</div>
                          <div className="font-semibold">{service.responseTime}</div>
                        </div>
                        {getStatusBadge(service.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Recent Activity</h2>
            
            {incidents.length > 0 ? (
              <div className="space-y-6">
                {incidents.map((incident, index) => (
                  <Card key={incident.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon('resolved')}
                          {incident.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getIncidentSeverityBadge(incident.severity)}
                          <Badge variant="outline">Resolved</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{incident.description}</p>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Started:</span>
                          <div className="font-medium">
                            {new Date(incident.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Resolved:</span>
                          <div className="font-medium">
                            {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'In progress'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Affected Services:</span>
                          <div className="font-medium">
                            {incident.affectedServices.join(', ')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recent Incidents</h3>
                  <p className="text-gray-600">
                    All systems have been running smoothly. We'll post any updates here if issues arise.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Performance Metrics</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.98%</div>
                  <h3 className="font-semibold mb-1">Overall Uptime</h3>
                  <p className="text-sm text-gray-600">Last 30 days</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">245ms</div>
                  <h3 className="font-semibold mb-1">Avg Response Time</h3>
                  <p className="text-sm text-gray-600">API endpoints</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                  <h3 className="font-semibold mb-1">Active Incidents</h3>
                  <p className="text-sm text-gray-600">Current issues</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">
              Get notified when we post status updates and maintenance announcements.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button>Subscribe</Button>
            </div>
            
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/contact" className="text-blue-600 hover:underline">
                Report an Issue
              </Link>
              <Link href="/help" className="text-blue-600 hover:underline">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/help" className="text-blue-600 hover:underline">
              Help Center
            </Link>
            <Link href="/about" className="text-blue-600 hover:underline">
              About Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}