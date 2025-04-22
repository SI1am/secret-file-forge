
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, EyeIcon, EyeOffIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the correct hash in the URL
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) {
      setError("Invalid or expired password reset link. Please request a new one.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    await updatePassword(password);
  };

  if (error === "Invalid or expired password reset link. Please request a new one.") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="mb-2">Invalid Reset Link</CardTitle>
            <CardDescription className="mb-6">
              The password reset link is invalid or has expired. Please request a new password reset.
            </CardDescription>
            <Button onClick={() => navigate("/reset-password")}>
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-primary rounded-full p-2">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Data-Vault</h1>
        </div>
        <p className="text-muted-foreground text-center">
          Create a new password
        </p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-xs text-muted-foreground text-center">
        <p>Your data remains encrypted and secure.</p>
        <p className="mt-1">© 2025 Data-Vault. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ResetPassword;
