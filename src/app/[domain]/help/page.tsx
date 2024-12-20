import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="min-h-[calc(100vh-3rem)] p-4 bg-muted/40">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Help & Support</CardTitle>
            <CardDescription>
              Find answers to common questions and get support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    How do I update my profile?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can update your profile information from the Profile
                    section in your account settings.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    How do I change my password?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Go to Settings → Password to change your account password.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Need additional help? Contact our support team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>For support inquiries, please contact:</p>
              <p className="mt-2">support@sportwise.net</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
