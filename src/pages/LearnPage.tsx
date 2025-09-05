import { useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import LearningDashboard from '@/components/learning/LearningDashboard';
import { useNavigate } from 'react-router-dom';

export const LearnPage = () => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("LearnPage effect - Auth state:", { isAuthenticated, isLoading, userId: user?.id });
    // If not authenticated and done loading, redirect to home/login page
    if (!isAuthenticated && !isLoading) {
      console.log("Not authenticated, redirecting to home");
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading Learning Dashboard...</p>
        </div>
      </div>
    );
  }

  // Only render the dashboard if authenticated
  if (isAuthenticated) {
    return <LearningDashboard />;
  }

  // This return shouldn't be reached due to the redirect, but included for safety
  return null;
};

export default LearnPage;
