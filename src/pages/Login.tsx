
import AuthForm from "@/components/auth/AuthForm";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

const Login = () => {
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
          Secure platform for managing sensitive data
        </p>
      </div>
      
      <AuthForm mode="login" />
      
      <Card className="mt-8 max-w-md w-full">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <h3 className="font-medium text-foreground mb-2">Demo Account</h3>
            <p>Email: demo@datavault.com</p>
            <p>Password: SecureDemo123!</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-xs text-muted-foreground text-center">
        <p>Your data is encrypted and secure.</p>
        <p className="mt-1">© 2025 Data-Vault. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
