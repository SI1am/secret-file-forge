
import AuthForm from "@/components/auth/AuthForm";
import { Lock } from "lucide-react";

const Register = () => {
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
          Create your secure account
        </p>
      </div>
      
      <AuthForm mode="register" />
      
      <div className="mt-8 text-xs text-muted-foreground text-center">
        <p>By registering, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="mt-4">Your data is encrypted and secure.</p>
        <p className="mt-1">© 2025 Data-Vault. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Register;
