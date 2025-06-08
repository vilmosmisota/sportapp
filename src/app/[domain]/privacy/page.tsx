"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, MapPin, Phone, Shield } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PrivacyPage() {
  const params = useParams();
  const domain = params.domain as string;
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Home Button - Top Left */}
      <div className="mb-6">
        <Link href={`/`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We are committed to protecting your privacy and ensuring the
            security of your personal information, especially when it comes to
            children's data.
          </p>
          <Badge variant="outline" className="text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* UK GDPR Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              UK GDPR Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This privacy policy complies with the UK General Data Protection
              Regulation (UK GDPR) and the Data Protection Act 2018. We take
              special care when processing children's data.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Children's Data Protection</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • Children under 13 require parental consent for data
                  processing
                </li>
                <li>
                  • Parents/guardians can manage their child's data and privacy
                  settings
                </li>
                <li>
                  • We apply enhanced security measures for all children's data
                </li>
                <li>
                  • Data is processed only for legitimate sports and educational
                  purposes
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* What We Collect */}
        <Card>
          <CardHeader>
            <CardTitle>What Information We Collect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Personal Information</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Full name and date of birth</li>
                  <li>• Contact details (email, phone, address)</li>
                  <li>• Emergency contact information</li>
                  <li>• Medical information (if relevant for safety)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Activity Information</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Training attendance records</li>
                  <li>• Performance and skill development data</li>
                  <li>• Photos and videos during activities</li>
                  <li>• Communication logs with parents/members</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Primary Purposes</h4>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Managing sports activities and training sessions</li>
                  <li>• Tracking attendance and participation</li>
                  <li>• Monitoring skill development and progress</li>
                  <li>• Communicating with parents/guardians and members</li>
                  <li>• Ensuring safety and emergency contact</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Legal Basis for Processing</h4>
                <p className="text-sm text-muted-foreground">
                  We process personal data based on consent (especially for
                  children under 13), legitimate interests for sports
                  administration, and contractual necessity for membership
                  services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights Under UK GDPR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Individual Rights</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Access:</strong> Request a copy of your data
                  </li>
                  <li>
                    • <strong>Rectification:</strong> Correct inaccurate
                    information
                  </li>
                  <li>
                    • <strong>Erasure:</strong> Request deletion of your data
                  </li>
                  <li>
                    • <strong>Portability:</strong> Transfer data to another
                    service
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Consent Management</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Withdraw consent:</strong> At any time
                  </li>
                  <li>
                    • <strong>Object to processing:</strong> For certain
                    purposes
                  </li>
                  <li>
                    • <strong>Restrict processing:</strong> Limit how we use
                    data
                  </li>
                  <li>
                    • <strong>Complain:</strong> To the ICO if concerned
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle>Data Security & Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Security Measures</h4>
              <p className="text-sm text-muted-foreground">
                We implement appropriate technical and organizational measures
                to protect personal data, including encryption, access controls,
                and regular security assessments.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Retention</h4>
              <p className="text-sm text-muted-foreground">
                We retain personal data only as long as necessary for the
                purposes outlined in this policy. Children's data is subject to
                enhanced retention controls and regular review.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you have any questions about this privacy policy or wish to
                exercise your rights, please contact us:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">privacy@yourorg.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">+44 (0) 123 456 7890</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Your Address, UK</span>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <p>
                  <strong>Data Protection Officer:</strong> If you have concerns
                  about how we handle your data, you can also contact the
                  Information Commissioner's Office (ICO) at ico.org.uk
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
