import ChangePasswordForm from "./components/ChangePasswordForm";

export default function PasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Password</h3>
        <p className="text-sm text-muted-foreground">
          Update your password to keep your account secure.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
