
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, FileImage, FileText, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // If user is already authenticated, redirect to vault
    if (isAuthenticated) {
      navigate("/vault");
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Secure Authentication",
      description: "End-to-end encrypted user authentication with JWT tokens and secure password management."
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Data Protection",
      description: "Sensitive data masking for Excel files, protecting PII and other confidential information."
    },
    {
      icon: <FileImage className="h-6 w-6" />,
      title: "Steganography",
      description: "Embed hidden watermarks within images using advanced steganography techniques."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "File Encryption",
      description: "Military-grade encryption for your most sensitive documents and files."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-secondary/20 py-16 md:py-24">
        <div className="vault-container flex flex-col items-center text-center">
          <div className="bg-primary rounded-full p-4 mb-6">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
            Data-Vault
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8 animate-slide-up">
            The secure platform for protecting and managing your sensitive data
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="button-primary text-lg px-8"
              onClick={() => navigate("/register")}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="text-lg"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
          
          <div className="mt-16 flex flex-col md:flex-row gap-4 max-w-4xl">
            <div className="flex-1 bg-card shadow-md rounded-lg p-6 border">
              <div className="text-4xl font-bold text-primary mb-2">256-bit</div>
              <div className="text-muted-foreground">Encryption Standard</div>
            </div>
            
            <div className="flex-1 bg-card shadow-md rounded-lg p-6 border">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Data Protection</div>
            </div>
            
            <div className="flex-1 bg-card shadow-md rounded-lg p-6 border">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Secure Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="vault-container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Advanced Security Features
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Protect your sensitive data with our comprehensive suite of security tools
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card-vault p-6 border hover:border-primary transition-colors"
              >
                <div className="bg-primary/10 rounded-full p-3 inline-flex mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="vault-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to secure your sensitive data?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of users who trust Data-Vault with their most sensitive information.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8"
            onClick={() => navigate("/register")}
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8">
        <div className="vault-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-primary rounded-full p-1.5 mr-2">
                <Lock className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Data-Vault</span>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
          
          <div className="border-t mt-6 pt-6 text-sm text-center text-muted-foreground">
            © 2025 Data-Vault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
