
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: false,
    notificationsEnabled: true,
    autoEncryptFiles: false,
    defaultWatermarkOpacity: 30,
    twoFactorEnabled: false,
    autoBackup: true,
    sessionTimeout: 30,
    fileSharingEnabled: true
  });
  
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      
      try {
        // Actual implementation would fetch from Supabase
        // For now, we'll use mock data
        
        setTimeout(() => {
          // Mock settings loading
          setSettings({
            darkMode: localStorage.getItem('darkMode') === 'true',
            notificationsEnabled: true,
            autoEncryptFiles: false,
            defaultWatermarkOpacity: 30,
            twoFactorEnabled: false,
            autoBackup: true,
            sessionTimeout: 30,
            fileSharingEnabled: true
          });
          setIsLoading(false);
        }, 500);
        
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Could not load settings");
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    
    // In a real app, this would update Supabase
    if (key === 'darkMode') {
      localStorage.setItem('darkMode', String(value));
      document.documentElement.classList.toggle('dark', value);
    }
    
    toast.success("Setting updated");
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    
    try {
      // Placeholder for account deletion
      toast.success("Account deletion requested");
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      toast.error("No email address found");
      return;
    }
    
    try {
      setIsLoading(true);
      // This would call Supabase to reset password
      // Since this is a demo, we'll just show a toast
      toast.info("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to send password reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-3 md:w-fit">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important events
                  </p>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => handleSettingChange("notificationsEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>File Defaults</CardTitle>
              <CardDescription>
                Set default behavior for file operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoEncryptFiles">Auto-Encrypt Files</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically encrypt files when uploading
                  </p>
                </div>
                <Switch
                  id="autoEncryptFiles"
                  checked={settings.autoEncryptFiles}
                  onCheckedChange={(checked) => handleSettingChange("autoEncryptFiles", checked)}
                />
              </div>
              
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <Label>Default Watermark Opacity: {settings.defaultWatermarkOpacity}%</Label>
                  <p className="text-sm text-muted-foreground">
                    Set the default opacity for watermarks
                  </p>
                </div>
                <Slider
                  min={5}
                  max={100}
                  step={5}
                  value={[settings.defaultWatermarkOpacity]}
                  onValueChange={(value) => handleSettingChange("defaultWatermarkOpacity", value[0])}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fileSharingEnabled">File Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing files with other users
                  </p>
                </div>
                <Switch
                  id="fileSharingEnabled"
                  checked={settings.fileSharingEnabled}
                  onCheckedChange={(checked) => handleSettingChange("fileSharingEnabled", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup">Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup your files
                  </p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password or reset it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleResetPassword} disabled={isLoading}>
                {isLoading ? "Processing..." : "Reset Password"}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorEnabled">Enable 2FA</Label>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code when signing in
                  </p>
                </div>
                <Switch
                  id="twoFactorEnabled"
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) => handleSettingChange("twoFactorEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
              <CardDescription>
                Manage your active sessions and timeout settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <Label>Session Timeout: {settings.sessionTimeout} minutes</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Slider
                  min={5}
                  max={60}
                  step={5}
                  value={[settings.sessionTimeout]}
                  onValueChange={(value) => handleSettingChange("sessionTimeout", value[0])}
                  className="w-full"
                />
              </div>
              
              <Button variant="outline" onClick={() => {
                toast.success("All other sessions have been signed out");
              }}>
                Sign Out Other Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Account</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user?.email || ""} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={user?.id || ""} disabled />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. It will permanently delete your
                      account and remove all of your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
