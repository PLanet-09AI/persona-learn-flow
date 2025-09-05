import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Target, RefreshCw, Play, Volume2, VolumeX, MessageCircle } from "lucide-react";
import { UserProfile } from "./LearningDashboard";
import { generateAIContent } from "@/services/ai";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { formatContent } from "@/utils/markdownUtils";
import { textToSpeech } from "@/utils/textToSpeech";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContentChat } from "./ContentChat";
import { useAuth } from "@/hooks/use-auth";
import QueueStatusIndicator from "@/components/ui/queue-status";
import "@/styles/markdown.css";
import "@/styles/markdown-premium.css";

interface ContentViewerProps {
  userProfile: UserProfile;
  content: string;
  onStartQuiz: () => void;
  onContentGenerated: (content: string) => void;
}

export const ContentViewer = ({ userProfile, content, onStartQuiz, onContentGenerated }: ContentViewerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth(); // Get user from auth context

  // Generate content using AI
  const generateContent = async (topic?: string) => {
    setIsGenerating(true);
    
    try {
      const targetTopic = topic || getRandomTopic();
      setCurrentTopic(targetTopic);
      
      const generatedContent = await generateAIContent({
        topic: targetTopic,
        field: userProfile.field,
        learningStyle: userProfile.learningStyle,
        userId: user?.id // Pass the user ID for tracking
      });
      
      onContentGenerated(generatedContent);
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle text-to-speech
  const handleTextToSpeech = () => {
    if (isSpeaking) {
      textToSpeech.stop();
      setIsSpeaking(false);
    } else {
      const plainText = content.replace(/[#*_~`]/g, '');
      textToSpeech.speak(plainText, {
        onEnd: () => setIsSpeaking(false)
      });
      setIsSpeaking(true);
    }
  };

  // Get a random topic based on the user's field
  const getRandomTopic = () => {
    const topics = {
      "Computer Science": ["Data Structures", "Algorithms", "Software Engineering", "Machine Learning", "Web Development"],
      "Mathematics": ["Calculus", "Linear Algebra", "Statistics", "Discrete Math", "Number Theory"],
      "Physics": ["Classical Mechanics", "Quantum Physics", "Thermodynamics", "Electromagnetism", "Relativity"],
      "Biology": ["Cell Biology", "Genetics", "Ecology", "Evolution", "Physiology"],
      "Chemistry": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry", "Analytical Chemistry"],
      "History": ["Ancient Civilizations", "Middle Ages", "Modern History", "World Wars", "Cold War"]
    };
    
    const fieldTopics = topics[userProfile.field as keyof typeof topics] || ["General Knowledge", "Basic Concepts", "Fundamentals"];
    return fieldTopics[Math.floor(Math.random() * fieldTopics.length)];
  };

  // Format the estimated reading time
  const getReadingTime = () => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min${minutes === 1 ? '' : 's'} read`;
  };

  useEffect(() => {
    // Generate content if none exists
    if (!content) {
      generateContent();
    }
    
    // Clean up speech on unmount
    return () => {
      if (isSpeaking) {
        textToSpeech.stop();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">{currentTopic || userProfile.field + " Learning"}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Personalized for {userProfile.learningStyle} learning style
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="h-3 w-3" /> {getReadingTime()}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
              <Target className="h-3 w-3" /> Level {userProfile.level}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={handleTextToSpeech}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isSpeaking ? "Stop Audio" : "Read Aloud"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => generateContent()}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? "Generating..." : "Regenerate"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 ml-auto"
              onClick={onStartQuiz}
            >
              <Play className="h-4 w-4" />
              Take Quiz
            </Button>
          </div>

          {/* Queue Status Indicator */}
          <QueueStatusIndicator />
          
          <Separator className="mb-4" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="content" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span className={isMobile ? 'hidden' : ''}>Content</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span className={isMobile ? 'hidden' : ''}>Ask Questions</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <div className="prose prose-lg max-w-none text-foreground">
                {(ReactMarkdown as any)({ 
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeRaw],
                  components: {
                    // ChatGPT-style headers (clean, professional)
                    h1: ({children}: any) => (
                      <h1 className="text-2xl font-semibold mt-8 mb-6 text-foreground border-b border-border pb-3">
                        {children}
                      </h1>
                    ),
                    h2: ({children}: any) => (
                      <h2 className="text-xl font-semibold mt-7 mb-4 text-foreground">
                        {children}
                      </h2>
                    ),
                    h3: ({children}: any) => (
                      <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">
                        {children}
                      </h3>
                    ),
                    h4: ({children}: any) => (
                      <h4 className="text-base font-semibold mt-5 mb-2 text-foreground">
                        {children}
                      </h4>
                    ),
                    
                    // ChatGPT-style paragraphs
                    p: ({children}: any) => (
                      <p className="mb-4 text-foreground leading-relaxed">
                        {children}
                      </p>
                    ),
                    
                    // ChatGPT-style lists - clean bullets
                    ul: ({children}: any) => (
                      <ul className="mb-4 pl-6 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({children}: any) => (
                      <ol className="mb-4 pl-6 space-y-1 list-decimal">
                        {children}
                      </ol>
                    ),
                    li: ({children}: any) => (
                      <li className="text-foreground leading-relaxed list-disc">
                        {children}
                      </li>
                    ),
                    
                    // ChatGPT-style code
                    code: ({inline, className, children, ...props}: any) => {
                      if (inline) {
                        return (
                          <code 
                            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground border"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code 
                          className={`block bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto text-foreground my-3 ${className || ''}`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    pre: ({children}: any) => (
                      <pre className="bg-muted p-4 rounded-lg my-4 overflow-x-auto border">
                        {children}
                      </pre>
                    ),
                    
                    // ChatGPT-style blockquotes
                    blockquote: ({children}: any) => (
                      <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 italic text-foreground/80 bg-muted/30 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    
                    // Links
                    a: ({href, children}: any) => (
                      <a 
                        href={href}
                        className="text-primary hover:underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    
                    // ChatGPT-style tables
                    table: ({children}: any) => (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full border-collapse border border-border rounded">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({children}: any) => (
                      <thead className="bg-muted/50">
                        {children}
                      </thead>
                    ),
                    th: ({children}: any) => (
                      <th className="border border-border px-4 py-3 text-left font-semibold">
                        {children}
                      </th>
                    ),
                    td: ({children}: any) => (
                      <td className="border border-border px-4 py-3">
                        {children}
                      </td>
                    ),
                    tr: ({children}: any) => (
                      <tr className="hover:bg-muted/30 transition-colors">
                        {children}
                      </tr>
                    ),
                    
                    // ChatGPT-style emphasis
                    strong: ({children}: any) => (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    ),
                    em: ({children}: any) => (
                      <em className="italic text-foreground/80">
                        {children}
                      </em>
                    ),
                  },
                  children: formatContent(content)
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="chat" className="space-y-4">
              <ContentChat content={content} title={`Ask about ${currentTopic || userProfile.field}`} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentViewer;
