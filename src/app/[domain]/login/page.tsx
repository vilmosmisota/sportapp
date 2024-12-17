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
    <div className="flex items-center justify-center w-full h-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm domain={params.domain} />
        </CardContent>
      </Card>
    </div>
  );
}
