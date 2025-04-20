
import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  Upload
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUploader from "@/components/files/FileUploader";
import { toast } from "sonner";

const VaultLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleFileUploadComplete = (files: File[]) => {
    toast.success(`${files.length} files uploaded`);
    setUploadDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-card border-r border-border transition-all duration-300 flex flex-col ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2
            className={`font-bold text-lg ${
              isSidebarCollapsed ? "hidden" : "block"
            }`}
          >
            Secure Vault
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 py-4 space-y-2">
          <NavLink
            to="/vault"
            end
            className={({ isActive }) =>
              `flex items-center ${
                isSidebarCollapsed ? "justify-center px-2" : "px-4"
              } py-2 ${
                isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            <Home className="h-5 w-5" />
            {!isSidebarCollapsed && (
              <span className="ml-3 text-sm">Dashboard</span>
            )}
          </NavLink>

          <NavLink
            to="/vault/settings"
            className={({ isActive }) =>
              `flex items-center ${
                isSidebarCollapsed ? "justify-center px-2" : "px-4"
              } py-2 ${
                isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            <Settings className="h-5 w-5" />
            {!isSidebarCollapsed && (
              <span className="ml-3 text-sm">Settings</span>
            )}
          </NavLink>
        </div>

        <div className="p-4 mt-auto space-y-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className={`w-full ${
                  isSidebarCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                {!isSidebarCollapsed && <span>Upload</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <FileUploader
                onUploadComplete={handleFileUploadComplete}
                maxFiles={5}
                acceptedTypes="*"
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className={`w-full ${
              isSidebarCollapsed ? "justify-center px-0" : ""
            }`}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default VaultLayout;
