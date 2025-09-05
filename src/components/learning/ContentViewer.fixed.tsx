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
import { ChatInterface } from "./ChatInterface";
import "@/styles/markdown.css";

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
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Generate content using AI
  const generateContent = async (topic?: string) => {
    setIsGenerating(true);
    
    try {
      const targetTopic = topic || getRandomTopic();
      setCurrentTopic(targetTopic);
      
      const generatedContent = await generateAIContent({
        topic: targetTopic,
        field: userProfile.field,
        learningStyle: userProfile.learningStyle
      });
      
      // Format content if needed
      const formattedContent = formatContent(generatedContent);
      
      // Pass content to parent component
      onContentGenerated(formattedContent);
      
      toast({
        title: "Content Generated",
        description: `New ${userProfile.learningStyle} learning content is ready!`,
      });
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
  
  // Generate content on component mount
  useEffect(() => {
    if (!content) {
      generateContent();
    }
    
    // Clean up any ongoing speech when component unmounts
    return () => {
      textToSpeech.stop();
      setIsSpeaking(false);
    };
  }, []);
  
  // Stop speech when content changes
  useEffect(() => {
    if (isSpeaking) {
      textToSpeech.stop();
      setIsSpeaking(false);
    }
  }, [content]);

  // Get a random topic based on the selected field
  const getRandomTopic = () => {
    const fieldTopics = {
      "Web Development": ["HTML Fundamentals", "CSS Layouts", "JavaScript Basics", "React Components", "API Integration"],
      "Data Science": ["Data Analysis", "Statistical Methods", "Machine Learning Algorithms", "Data Visualization", "Python for Data Science"],
      "Digital Marketing": ["SEO Techniques", "Social Media Marketing", "Content Strategy", "Email Marketing", "Analytics Tools"],
      "Graphic Design": ["Color Theory", "Typography", "Layout Design", "Branding Elements", "Design Software"],
      "Business Strategy": ["Market Analysis", "Competitive Advantage", "Business Models", "Strategic Planning", "Growth Strategies"],
      "Mobile Development": ["UI/UX for Mobile", "Native vs Hybrid Apps", "Mobile Testing", "Performance Optimization", "App Store Deployment"],
      "Artificial Intelligence": ["Neural Networks", "Natural Language Processing", "Computer Vision", "Ethics in AI", "Reinforcement Learning"]
    };
    
    const topics = fieldTopics[userProfile.field as keyof typeof fieldTopics] || 
      ["Fundamentals", "Advanced Concepts", "Best Practices", "Future Trends", "Practical Applications"];
    
    return topics[Math.floor(Math.random() * topics.length)];
  };

  // Learning style specific content templates - these would be used in a real implementation
  // to guide the AI content generation
  const getStylePrompt = (topic: string) => {
    switch (userProfile.learningStyle) {
      case "visual":
        return `Create visual learning content about ${topic}. Include descriptions of diagrams, charts, and images that would help visual learners. Use spatial organization and highlight relationships between concepts. Include visualization exercises.`;
        
      case "auditory":
        return `Create auditory-focused learning content about ${topic}. Use conversational language, include discussion points, use metaphors and stories. Structure content as if explaining verbally. Include listening exercises.`;
        
      case "reading":
        return `Create reading-focused learning content about ${topic}. Use clear text explanations, provide definitions, use logical organization with headers and bullet points. Include reading comprehension exercises.`;
        
      case "kinesthetic":
        return `Create kinesthetic learning content about ${topic}. Focus on practical applications, include step-by-step instructions for hands-on activities. Describe interactive exercises and real-world examples.

The quiz will include practical scenarios where you apply ${topic}!

**Physical Prep**: Stretch your fingers - time to show what you can do!`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topic Selection */}
      <div className="flex justify-end">
        <Button 
          variant="outline"
          onClick={() => generateContent()}
          disabled={isGenerating}
          className="text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
          New Topic
        </Button>
      </div>

      {/* Content Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {currentTopic || "Loading Topic..."}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              ~10 min read
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="text-center py-12">
              <div className="animate-spin mx-auto mb-4 h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-muted-foreground">Generating personalized content for {userProfile.learningStyle} learners...</p>
            </div>
          ) : (
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Learning Content
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Ask Questions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="mt-0">
                <div className="prose dark:prose-invert max-w-none overflow-auto max-h-[60vh] custom-scrollbar">
                  {/* Text-to-speech controls */}
                  {content && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (isSpeaking) {
                            textToSpeech.stop();
                            setIsSpeaking(false);
                          } else {
                            // Remove markdown syntax for better speech
                            const plainText = content.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n/g, ' ');
                            textToSpeech.speak(plainText, { rate: 1, pitch: 1 });
                            setIsSpeaking(true);
                          }
                        }}
                      >
                        {isSpeaking ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                        {isSpeaking ? "Stop Audio" : "Listen"}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {isSpeaking ? "Click to stop audio" : "Text-to-speech available"}
                      </p>
                    </div>
                  )}
                  {(ReactMarkdown as any)({
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeRaw],
                    components: {
                      // Headers with enhanced styling
                      h1: ({children}: any) => (
                        <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-border">{children}</h1>
                      ),
                      h2: ({children}: any) => (
                        <h2 className="text-xl font-semibold mt-5 mb-3 text-primary">{children}</h2>
                      ),
                      h3: ({children}: any) => (
                        <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>
                      ),
                      
                      // Table styling
                      table: ({children}: any) => (
                        <div className="my-6 w-full overflow-y-auto">
                          <table className="min-w-full divide-y divide-border border border-border rounded-md">{children}</table>
                        </div>
                      ),
                      thead: ({children}: any) => (
                        <thead className="bg-muted">{children}</thead>
                      ),
                      th: ({children}: any) => (
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</th>
                      ),
                      td: ({children}: any) => (
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{children}</td>
                      ),
                      tr: ({children}: any) => (
                        <tr className="border-t border-border">{children}</tr>
                      ),
                      
                      // Enhanced links
                      a: ({href, children}: any) => (
                        <a 
                          href={href} 
                          className="text-primary hover:underline" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      
                      // Enhanced code blocks with syntax styling
                      code: ({className, children, node, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return (
                          <code 
                            className={`${match ? `language-${match[1]}` : ''} bg-muted px-1.5 py-0.5 rounded text-sm font-mono`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      
                      // Better code block container
                      pre: ({children}: any) => (
                        <pre className="bg-muted p-4 rounded-md my-4 overflow-x-auto border border-border font-mono text-sm">
                          {children}
                        </pre>
                      ),
                      
                      // Enhanced blockquotes
                      blockquote: ({children}: any) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                          {children}
                        </blockquote>
                      ),
                      
                      // Lists with better spacing
                      ul: ({children}: any) => <ul className="space-y-2 my-4 ml-6">{children}</ul>,
                      ol: ({children}: any) => <ol className="space-y-2 my-4 ml-6">{children}</ol>,
                      li: ({children}: any) => <li className="pl-1">{children}</li>,
                    },
                    children: content
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="mt-0">
                {content ? (
                  <ChatInterface content={content} userProfile={userProfile} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Generate content first to start chatting about it.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {content && !isGenerating && (
        <div className="flex gap-4 justify-center">
          <Button onClick={() => generateContent()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate New Content
          </Button>
          <Button onClick={onStartQuiz} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Take Quiz
          </Button>
        </div>
      )}
    </div>
  );
};
