import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Trophy } from "lucide-react";
import { UserProfile } from "./LearningDashboard";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizComponentProps {
  content: string;
  userProfile: UserProfile;
  onQuizComplete: (score: number) => void;
}

export const QuizComponent = ({ content, userProfile, onQuizComplete }: QuizComponentProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isLoading, setIsLoading] = useState(true);

  // Generate quiz questions based on content and learning style
  const generateQuestions = () => {
    setIsLoading(true);
    
    // Mock quiz generation based on learning style
    const baseQuestions = [
      {
        id: 1,
        question: `What is the main concept discussed in the ${userProfile.field} content?`,
        options: [
          "Basic fundamentals only",
          "Advanced theoretical concepts",
          "Practical applications and core principles", 
          "Historical background information"
        ],
        correctAnswer: 2,
        explanation: "The content covers both practical applications and core principles, making it comprehensive for learners."
      },
      {
        id: 2,
        question: `According to the content, what learning approach is most effective for ${userProfile.learningStyle} learners?`,
        options: [
          userProfile.learningStyle === "visual" ? "Diagrams and visual representations" : "Text-based explanations",
          userProfile.learningStyle === "auditory" ? "Listening and verbal explanations" : "Written summaries",
          userProfile.learningStyle === "kinesthetic" ? "Hands-on practice and exercises" : "Reading detailed texts",
          "Memorizing facts and figures"
        ],
        correctAnswer: userProfile.learningStyle === "visual" ? 0 : userProfile.learningStyle === "auditory" ? 1 : userProfile.learningStyle === "kinesthetic" ? 2 : 0,
        explanation: `This approach aligns perfectly with your ${userProfile.learningStyle} learning style preferences.`
      },
      {
        id: 3,
        question: `What is the recommended next step after learning this topic in ${userProfile.field}?`,
        options: [
          "Move to completely unrelated topics",
          "Practice and apply the concepts learned",
          "Ignore the practical applications",
          "Only focus on theoretical aspects"
        ],
        correctAnswer: 1,
        explanation: "Practicing and applying concepts helps reinforce learning and builds practical skills."
      }
    ];

    // Add learning style specific questions
    if (userProfile.learningStyle === "visual") {
      baseQuestions.push({
        id: 4,
        question: "For visual learners, which element is most important in the content structure?",
        options: [
          "Audio descriptions",
          "Diagrams and visual analogies",
          "Text walls without formatting",
          "Abstract concepts only"
        ],
        correctAnswer: 1,
        explanation: "Visual learners benefit most from diagrams, charts, and visual analogies that help them see relationships and concepts."
      });
    }

    setTimeout(() => {
      setQuestions(baseQuestions);
      setAnswers(new Array(baseQuestions.length).fill(null));
      setIsLoading(false);
    }, 1500);
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isComplete && !isLoading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isComplete) {
      handleFinishQuiz();
    }
  }, [timeLeft, isComplete, isLoading]);

  // Generate questions on component mount
  useEffect(() => {
    generateQuestions();
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
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setShowExplanation(false);
    }
  };

  const handleFinishQuiz = () => {
    const finalAnswers = selectedAnswer !== null ? 
      [...answers.slice(0, currentQuestionIndex), selectedAnswer, ...answers.slice(currentQuestionIndex + 1)] : 
      answers;
    
    const correctCount = questions.reduce((count, question, index) => {
      return count + (finalAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setIsComplete(true);
    onQuizComplete(finalScore);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin mx-auto mb-4 h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <p className="text-muted-foreground">Generating personalized quiz questions...</p>
        <p className="text-sm text-muted-foreground mt-2">Based on your {userProfile.learningStyle} learning style</p>
      </div>
    );
  }

  if (isComplete) {
    const correctAnswers = questions.reduce((count, question, index) => {
      return count + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Trophy className="h-16 w-16 text-yellow-500" />
        </div>
        
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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (showExplanation ? 1 : 0)) / (questions.length * 2)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quiz Time!</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{userProfile.field}</Badge>
            <Badge variant="secondary">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
        </div>
        <div className="text-right">
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
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Button
          onClick={handleNextQuestion}
          disabled={!showExplanation && selectedAnswer === null}
        >
          {showExplanation 
            ? (currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question')
            : 'Submit Answer'
          }
        </Button>
      </div>
    </div>
  );
};