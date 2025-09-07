import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminPaymentPanel } from "@/components/admin/AdminPaymentPanel";
import { Shield, Key, Users, CreditCard, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("payments");
  
  // Simple admin check - in production, you'd want proper role-based access
  const isAdmin = user?.email?.includes("admin") || user?.email === "admin@example.com";

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Please log in to access the admin panel.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="text-red-700">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <Key className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to access the admin panel.
                <br />
                <span className="text-xs text-muted-foreground mt-2 block">
                  Contact your administrator if you believe this is an error.
                </span>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Admin Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={activeSection === "payments" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("payments")}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Payments
              </Button>
              
              <Button
                variant={activeSection === "users" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("users")}
                className="flex items-center gap-2"
                disabled
              >
                <Users className="h-4 w-4" />
                Users
              </Button>
              
              <Button
                variant={activeSection === "settings" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("settings")}
                className="flex items-center gap-2"
                disabled
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="container mx-auto px-4 py-8">
        {activeSection === "payments" && <AdminPaymentPanel />}
        
        {activeSection === "users" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  User management features coming soon...
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
        
        {activeSection === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  System settings panel coming soon...
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
