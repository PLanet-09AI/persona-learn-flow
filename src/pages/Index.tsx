import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { Brain } from "lucide-react";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [showLoader, setShowLoader] = useState(true);
  const navigate = useNavigate();

  // Add a small delay to avoid flashing the login screen briefly
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  
  // Redirect authenticated users to the learning page
  useEffect(() => {
    if (isAuthenticated && !isLoading && !showLoader) {
      navigate('/learn');
    }
  }, [isAuthenticated, isLoading, showLoader, navigate]);

  if (isLoading || showLoader) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading Ndu AI Learning System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Ndu AI Learning System
          </h1>
          <p className="text-muted-foreground mb-8">Personalized learning powered by AI</p>
        </div>
        <AuthForm />
      </div>
    );
  }

  // The navigation to /learn happens in the useEffect hook above
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground">Redirecting to learning dashboard...</p>
      </div>
    </div>
  );
};

export default Index;