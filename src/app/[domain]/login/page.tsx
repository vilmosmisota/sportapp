import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import LoginForm from "./components/LoginForm";

export default function LoginPage({ params }: { params: { domain: string } }) {
  return (
    <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-sm">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm domain={params.domain} />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Contact your administrator if you need access to the platform
        </p>
      </div>
    </div>
  );
}
