import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Trophy, BarChart3, User, FileText, CreditCard } from "lucide-react";
import { FieldSelection } from "./FieldSelection";
import { LearningStyleSelection } from "./LearningStyleSelection";
import { ContentViewer } from "./ContentViewer";
import { QuizComponent } from "./QuizComponentNew";
import { Leaderboard } from "./Leaderboard";
import { UserMenu } from "@/components/ui/user-menu";

export type LearningStyle = "visual" | "auditory" | "reading" | "kinesthetic";

export interface UserProfile {
  id?: string; // Add optional id field
  field: string;
  learningStyle: LearningStyle;
  score: number;
  level: number;
}

const LearningDashboard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<"field" | "style" | "learning" | "quiz" | "leaderboard">("field");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    field: "",
    learningStyle: "visual",
    score: 0,
    level: 1
  });
  const [currentContent, setCurrentContent] = useState<string>("");

  const handleFieldSelect = (field: string) => {
    setUserProfile(prev => ({ ...prev, field }));
    setCurrentStep("style");
  };

  const handleStyleSelect = (style: LearningStyle) => {
    setUserProfile(prev => ({ ...prev, learningStyle: style }));
    setCurrentStep("learning");
  };

  const handleStartQuiz = () => {
    setCurrentStep("quiz");
  };

  const handleQuizComplete = (score: number) => {
    setUserProfile(prev => ({ 
      ...prev, 
      score: prev.score + score,
      level: Math.floor((prev.score + score) / 100) + 1
    }));
    setCurrentStep("leaderboard");
  };

  const handleNewLesson = () => {
    setCurrentStep("learning");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                Ndu AI Learning System
              </h1>
              <p className="text-muted-foreground">Personalized learning powered by AI</p>
            </div>
            <div className="flex-1 flex justify-end">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Learning Progress</span>
            <span className="text-sm font-medium">Level {userProfile.level} • {userProfile.score} points</span>
          </div>
          <div className="w-full bg-progress-bg rounded-full h-2">
            <div 
              className="bg-progress-fill h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((userProfile.score % 100), 100)}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto justify-center md:justify-start">
          <Button
            variant={currentStep === "field" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentStep("field")}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Field
          </Button>
          <Button
            variant={currentStep === "style" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentStep("style")}
            disabled={!userProfile.field}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Style
          </Button>
          <Button
            variant={currentStep === "learning" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentStep("learning")}
            disabled={!userProfile.field || !userProfile.learningStyle}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Learn
          </Button>
          <Button
            variant={currentStep === "leaderboard" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentStep("leaderboard")}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Button>
          
          {/* Divider */}
          <div className="h-8 w-px bg-border mx-2"></div>
          
          {/* Additional Features */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/cv-generator')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            CV Generator
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/subscription')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Subscription
          </Button>
        </div>

        {/* Main Content */}
        <Card className="min-h-[500px] overflow-hidden">
          <CardContent className="p-3 sm:p-6">
            {currentStep === "field" && (
              <FieldSelection onFieldSelect={handleFieldSelect} />
            )}
            
            {currentStep === "style" && (
              <LearningStyleSelection 
                selectedField={userProfile.field}
                onStyleSelect={handleStyleSelect}
              />
            )}
            
            {currentStep === "learning" && (
              <ContentViewer
                userProfile={userProfile}
                content={currentContent}
                onStartQuiz={handleStartQuiz}
                onContentGenerated={setCurrentContent}
              />
            )}
            
            {currentStep === "quiz" && (
              <QuizComponent
                content={currentContent}
                userProfile={userProfile}
                onQuizComplete={handleQuizComplete}
              />
            )}
            
            {currentStep === "leaderboard" && (
              <Leaderboard
                userProfile={userProfile}
                onNewLesson={handleNewLesson}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningDashboard;