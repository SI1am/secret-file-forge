
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "sonner";

type AuthFormProps = {
  mode: "login" | "register";
  onSuccess?: () => void;
};

const AuthForm = ({ mode, onSuccess }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (mode === "register" && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    // In a real application, this would make an API call to your authentication endpoint
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock successful auth
      localStorage.setItem("user", JSON.stringify({ 
        email: formData.email,
        token: "mock-jwt-token-would-come-from-backend",
        name: formData.email.split("@")[0] 
      }));
      
      toast.success(`Successfully ${mode === "login" ? "logged in" : "registered"}!`);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/vault");
      }
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {mode === "login" ? "Welcome Back" : "Create Your Secure Account"}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === "login"
            ? "Enter your credentials to access your vault"
            : "Register to start securely managing your sensitive data"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <div 
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full button-primary"
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {mode === "login" ? (
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-primary"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-primary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
