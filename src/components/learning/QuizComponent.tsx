import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile } from "./LearningDashboard";
import { generateQuiz } from "@/services/quiz";
import { attemptService } from "@/services/firebase";
import type { Question } from "@/types/learning";

interface QuizComponentProps {
  content: string;
  userProfile: UserProfile;
  userId: string;
  contentArtifactId?: string;
  onQuizComplete: (score: number) => void;
}

function QuizComponent({ content, userProfile, userId, contentArtifactId, onQuizComplete }: QuizComponentProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingResult, setIsSavingResult] = useState(false);

  // Generate AI-powered quiz questions based on content and learning style
  const generateQuestions = async () => {
    setIsLoading(true);
    
    try {
      const generatedQuestions = await generateQuiz(
        content,
        userProfile.learningStyle,
        userProfile.field
      );
      
      // Validate response
      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        throw new Error('No valid questions were generated');
      }

      // Initialize quiz state
      setQuestions(generatedQuestions);
      setAnswers(new Array(generatedQuestions.length).fill(null));
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isComplete && !isLoading && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isComplete && questions.length > 0) {
      handleFinishQuiz();
    }
  }, [timeLeft, isComplete, isLoading, questions.length]);

  // Generate questions on component mount
  useEffect(() => {
    generateQuestions();
    
    // Clean up any ongoing speech when component unmounts
    return () => {
      // Import is used here to avoid circular dependencies
      import('@/utils/textToSpeech').then(module => {
        const { textToSpeech } = module;
        textToSpeech.stop();
      });
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setAnswers(newAnswers);
    }

    if (showExplanation) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(answers[currentQuestionIndex + 1]);
        setShowExplanation(false);
      } else {
        handleFinishQuiz();
      }
    } else {
      setShowExplanation(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (showExplanation) {
      setShowExplanation(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setShowExplanation(false);
    }
  };

  const handleFinishQuiz = async () => {
    // Save current answer if not saved
    if (selectedAnswer !== null && !showExplanation) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setAnswers(newAnswers);
    }

    // Calculate score
    const correctAnswers = answers.reduce((count, answer, index) => {
      if (questions[index] && answer === questions[index].correctAnswer) {
        return count + 1;
      }
      return count;
    }, 0);

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setIsComplete(true);

    // Save quiz attempt to Firestore
    setIsSavingResult(true);
    try {
      const timeTaken = 300 - timeLeft;
      
      // Create a dummy quiz ID based on content (in production, this would come from the content artifact)
      const quizId = contentArtifactId || `quiz_${Date.now()}`;
      
      // Save the attempt
      await attemptService.saveAttempt({
        userId,
        quizId,
        answers: answers.map(a => a ?? -1),
        score: finalScore,
        timeTaken,
        completed: true,
        timestamp: new Date()
      });

      console.log('✅ Quiz attempt saved to Firestore:', {
        userId,
        quizId,
        score: finalScore,
        correctAnswers,
        totalQuestions: questions.length,
        timeTaken
      });

      toast({
        title: "Success",
        description: "Your quiz results have been saved!",
        variant: "default"
      });
    } catch (error) {
      console.error('❌ Error saving quiz attempt:', error);
      toast({
        title: "Warning",
        description: "Quiz completed but results could not be saved. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsSavingResult(false);
    }

    onQuizComplete(finalScore);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Generating quiz questions...</p>
      </div>
    );
  }

  // Show error state if no questions were loaded
  if (!isLoading && questions.length === 0) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold">Failed to Generate Quiz</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn't generate quiz questions based on the learning content. Please try again or go back to the learning content.
        </p>
        <div className="flex gap-3 justify-center mt-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Content
          </Button>
          <Button onClick={generateQuestions}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show results if quiz is completed
  if (isComplete) {
    // Calculate correct answers
    const correctAnswers = answers.reduce((count, answer, index) => {
      if (questions[index] && answer === questions[index].correctAnswer) {
        return count + 1;
      }
      return count;
    }, 0);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground">Here are your results</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">{score}%</div>
              <p className="text-muted-foreground">
                {correctAnswers} out of {questions.length} correct
              </p>
              
              <div className="space-y-2">
                {score >= 80 && <Badge className="bg-success text-success-foreground">Excellent!</Badge>}
                {score >= 60 && score < 80 && <Badge className="bg-warning text-warning-foreground">Good Job!</Badge>}
                {score < 60 && <Badge className="bg-destructive text-destructive-foreground">Keep Learning!</Badge>}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>+{score} points earned</p>
                <p>Time taken: {formatTime(300 - timeLeft)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safely get the current question (with null check)
  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  // Calculate progress safely (avoid division by zero)
  const progress = questions.length > 0 
    ? ((currentQuestionIndex + (showExplanation ? 1 : 0)) / (questions.length * 2)) * 100
    : 0;

  // If there's no current question, show an error
  if (!currentQuestion) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-muted-foreground">
          Question data is not available. Please try regenerating the quiz.
        </div>
        <Button onClick={generateQuestions}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Quiz Time!</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline">{userProfile.field}</Badge>
            <Badge variant="secondary">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
        </div>
        <div className="text-right self-end sm:self-auto">
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="h-5 w-5 text-primary" />
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-muted-foreground">Time remaining</p>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showExplanation ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show answers with correct/incorrect indicators */}
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 flex items-center gap-3 ${
                      index === currentQuestion.correctAnswer
                        ? 'border-quiz-correct bg-quiz-correct/10'
                        : index === selectedAnswer && index !== currentQuestion.correctAnswer
                        ? 'border-quiz-incorrect bg-quiz-incorrect/10'
                        : 'border-border'
                    }`}
                  >
                    {index === currentQuestion.correctAnswer ? (
                      <CheckCircle className="h-5 w-5 text-quiz-correct" />
                    ) : index === selectedAnswer ? (
                      <XCircle className="h-5 w-5 text-quiz-incorrect" />
                    ) : (
                      <div className="h-5 w-5" />
                    )}
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    <span className={index === currentQuestion.correctAnswer ? 'font-medium' : ''}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Explanation:</h4>
                <p className="text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 && !showExplanation}
        >
          Previous
        </Button>
        <Button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null && !showExplanation}
        >
          {showExplanation
            ? currentQuestionIndex < questions.length - 1
              ? "Next Question"
              : "Finish Quiz"
            : "Check Answer"}
        </Button>
      </div>
    </div>
  );
}

// Make both default and named exports available
export default QuizComponent;
export { QuizComponent };
