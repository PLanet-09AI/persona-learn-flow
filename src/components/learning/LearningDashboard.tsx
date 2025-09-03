import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Trophy, BarChart3 } from "lucide-react";
import { FieldSelection } from "./FieldSelection";
import { LearningStyleSelection } from "./LearningStyleSelection";
import { ContentViewer } from "./ContentViewer";
import { QuizComponent } from "./QuizComponent";
import { Leaderboard } from "./Leaderboard";

export type LearningStyle = "visual" | "auditory" | "reading" | "kinesthetic";

export interface UserProfile {
  field: string;
  learningStyle: LearningStyle;
  score: number;
  level: number;
}

const LearningDashboard = () => {
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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Learning System
          </h1>
          <p className="text-muted-foreground">Personalized learning powered by AI</p>
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
        <div className="flex gap-2 mb-6 overflow-x-auto">
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
        </div>

        {/* Main Content */}
        <Card className="min-h-[500px]">
          <CardContent className="p-6">
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