"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Calendar,
  MapPin,
  FileText,
  Loader2,
  Shield,
  Info,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Types
interface ABNData {
  abn: string;
  entityName: string;
  entityType: string;
  status: string;
  registrationDate: string;
  address: string;
  gstStatus: string;
  businessNames: string[];
  cancellationDate?: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: ABNData;
  abn?: string;
}

// Mock ABN data for demonstration
const mockABNData: Record<string, ABNData> = {
  "12345678901": {
    abn: "12 345 678 901",
    entityName: "Melbourne Plumbing Services Pty Ltd",
    entityType: "Australian Private Company",
    status: "Active",
    registrationDate: "2018-03-15",
    address: "123 Collins Street, Melbourne VIC 3000",
    gstStatus: "Registered for GST",
    businessNames: ["Melbourne Plumbing Services", "MPS Plumbing"]
  },
  "98765432109": {
    abn: "98 765 432 109",
    entityName: "Sarah's Cafe & Catering",
    entityType: "Sole Trader",
    status: "Active",
    registrationDate: "2020-07-22",
    address: "456 Chapel Street, Richmond VIC 3121",
    gstStatus: "Not registered for GST",
    businessNames: ["Sarah's Cafe"]
  },
  "11111111111": {
    abn: "11 111 111 111",
    entityName: "Test Business Pty Ltd",
    entityType: "Australian Private Company",
    status: "Cancelled",
    registrationDate: "2015-01-10",
    cancellationDate: "2023-06-30",
    address: "789 Test Street, Melbourne VIC 3000",
    gstStatus: "Not registered for GST",
    businessNames: []
  }
};

const validationCriteria = [
  {
    criterion: "ABN Format",
    description: "Must be 11 digits in correct format",
    icon: FileText
  },
  {
    criterion: "Active Status",
    description: "ABN must be currently active with ASIC",
    icon: CheckCircle
  },
  {
    criterion: "Entity Match",
    description: "Business name must match ABN registration",
    icon: Building
  },
  {
    criterion: "Registration Date",
    description: "ABN must be registered for at least 30 days",
    icon: Calendar
  }
];

const testExamples = [
  {
    abn: "12345678901",
    description: "Valid active company ABN",
    status: "valid"
  },
  {
    abn: "98765432109",
    description: "Valid sole trader ABN",
    status: "valid"
  },
  {
    abn: "11111111111",
    description: "Cancelled ABN (will fail)",
    status: "invalid"
  }
];

export default function ABNTestingTool() {
  const [abn, setAbn] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState("");

  const formatABN = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    const limited = digits.slice(0, 11);
    
    // Format as XX XXX XXX XXX
    if (limited.length <= 2) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 2)} ${limited.slice(2)}`;
    if (limited.length <= 8) return `${limited.slice(0, 2)} ${limited.slice(2, 5)} ${limited.slice(5)}`;
    return `${limited.slice(0, 2)} ${limited.slice(2, 5)} ${limited.slice(5, 8)} ${limited.slice(8)}`;
  };

  const handleABNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatABN(e.target.value);
    setAbn(formatted);
    setError("");
    setValidationResult(null);
  };

  const validateABN = async () => {
    const cleanABN = abn.replace(/\s/g, '');
    
    if (cleanABN.length !== 11) {
      setError("ABN must be exactly 11 digits");
      return;
    }

    setIsValidating(true);
    setError("");
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const abnData = mockABNData[cleanABN];
    
    if (!abnData) {
      setValidationResult({
        isValid: false,
        error: "ABN not found in Australian Business Register",
        abn: cleanABN
      });
    } else if (abnData.status === "Cancelled") {
      setValidationResult({
        isValid: false,
        error: "This ABN has been cancelled and cannot be used",
        data: abnData
      });
    } else {
      setValidationResult({
        isValid: true,
        data: abnData
      });
    }
    
    setIsValidating(false);
  };

  const useTestExample = (testABN: string) => {
    setAbn(formatABN(testABN));
    setValidationResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header */}
      <section className="pt-32 pb-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link href="/help" className="inline-flex items-centre text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Centre
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-centre mb-6">
              <Zap className="w-10 h-10 text-primary mr-4" />
              <div>
                <h1 className="text-4xl font-black text-gray-900">
                  ABN Validation Tool
                </h1>
                <p className="text-gray-600 mt-2">
                  Test your ABN before submitting your business profile
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABN Testing Tool */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-centre">
                <Search className="w-5 h-5 mr-2" />
                Enter Your ABN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Australian Business Number (ABN)
                  </label>
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      placeholder="XX XXX XXX XXX"
                      value={abn}
                      onChange={handleABNChange}
                      className="flex-1 text-lg font-mono"
                      maxLength={13} // Includes spaces
                    />
                    <Button 
                      onClick={validateABN}
                      disabled={!abn || isValidating}
                      className="px-8"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        'Validate ABN'
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm mt-2">{error}</p>
                  )}
                </div>

                {/* Test Examples */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Try these test examples:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {testExamples.map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => useTestExample(example.abn)}
                        className="text-xs"
                      >
                        {formatABN(example.abn)} - {example.description}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Validation Results */}
      {validationResult && (
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {validationResult.isValid ? (
                <Alert className="border-green-200 bg-green-50 mb-6">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    ✅ ABN is valid and can be used for registration!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50 mb-6">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium">
                    ❌ {validationResult.error}
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-centre">
                      <Building className="w-5 h-5 mr-2" />
                      ABN Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">ABN</label>
                          <p className="font-mono text-lg">{validationResult.data.abn}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Entity Name</label>
                          <p className="font-semibold">{validationResult.data.entityName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Entity Type</label>
                          <p>{validationResult.data.entityType}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <div className="flex items-centre">
                            <Badge 
                              variant={validationResult.data.status === 'Active' ? 'default' : 'destructive'}
                              className="mr-2"
                            >
                              {validationResult.data.status}
                            </Badge>
                            {validationResult.data.cancellationDate && (
                              <span className="text-sm text-gray-500">
                                (Cancelled: {validationResult.data.cancellationDate})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Registration Date</label>
                          <p>{validationResult.data.registrationDate}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <p>{validationResult.data.address}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">GST Status</label>
                          <p>{validationResult.data.gstStatus}</p>
                        </div>
                        {validationResult.data.businessNames.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Business Names</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {validationResult.data.businessNames.map((name, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Validation Criteria */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-centre">
            Validation Criteria
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {validationCriteria.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full text-centre">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-full grid place-items-centre mx-auto mb-4">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{item.criterion}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    About ABN Validation
                  </h3>
                  <div className="text-blue-800 space-y-2">
                    <p>
                      This tool validates your ABN against the Australian Business Register (ABR) to ensure:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Your ABN is correctly formatted and exists</li>
                      <li>Your business is currently active and registered</li>
                      <li>The business name matches your ABN registration</li>
                      <li>Your registration meets SuburbMates requirements</li>
                    </ul>
                    <p className="mt-4">
                      <strong>Note:</strong> This is a testing tool using sample data. 
                      Actual validation during signup uses live ABR data.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-centre">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
              <CardContent className="p-12">
                <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Join SuburbMates?
                </h2>
                <p className="text-xl text-green-100 mb-8">
                  Once your ABN is validated, you can create your business profile in minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-centre">
                  <Link href="/signup">
                    <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                      Create Business Profile
                    </Button>
                  </Link>
                  <Link href="/help/business-profile">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Business Profile Help
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}