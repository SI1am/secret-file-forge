
import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock, User, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";

const VaultLayout = () => {
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    toast.info("Logging out...");
    setTimeout(() => {
      logout();
      navigate("/login");
    }, 500);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="px-4 h-16 flex items-center justify-between vault-container">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-full p-1.5">
              <Lock className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Data-Vault</h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2" onClick={() => navigate("/vault/settings")}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 text-vault-danger" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="vault-container py-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 bg-muted/30">
        <div className="vault-container flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-xs text-muted-foreground">
            © 2025 Data-Vault. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Help Center
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VaultLayout;
