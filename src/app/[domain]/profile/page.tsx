import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerClient } from "@/libs/supabase/server";

export default async function ProfilePage() {
  const supabase = getServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session!.user;

  return (
    <div className="min-h-[calc(100vh-3rem)] p-4 bg-muted/40">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              View and manage your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium">Last Sign In</p>
              <p className="text-sm text-muted-foreground">
                {new Date(user.last_sign_in_at || "").toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Additional information about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium">Account Created</p>
              <p className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleString()}
              </p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium">Account ID</p>
              <p className="text-sm font-mono text-muted-foreground">
                {user.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
