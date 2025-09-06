import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2, MessageCircle, BookOpen, ListChecks, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { openRouterService } from "@/services/openrouter";
import { ModelSelector } from "../ui/model-selector";
import { PromptEditor } from "../ui/prompt-editor";
import { useChatCache } from "../../hooks/use-chat-cache";
import { generateLearningOutcomes } from "@/utils/markdownUtils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/hooks/use-auth";
import "../../styles/markdown-enhanced.css";
import "../../styles/markdown-premium.css";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ContentChatProps {
  content: string;
  title?: string;
  topic?: string;
}

export const ContentChat = ({ content, title = "Ask about this content", topic = "" }: ContentChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("qwen/qwen3-14b:free");
  const [systemPrompt, setSystemPrompt] = useState<string>(
    `You are an AI learning assistant for the Persona Learning System.

**FORMATTING REQUIREMENTS:**
- Format ALL responses in clean, well-structured **GitHub Flavored Markdown**
- Use ## for main topics, ### for subtopics, #### for details
- Include relevant emojis (📚 📖 💡 ⚡ 🎯 etc.) in headings for visual appeal
- Use **bold** for key terms and important concepts
- Use \`inline code\` for technical terms, formulas, or specific details
- Use > blockquotes for important insights, definitions, or key takeaways
- Create organized lists: numbered for steps/processes, bullets for features/points
- Use tables when comparing concepts or showing structured information
- Add code blocks with \`\`\`language\`\`\` for examples, formulas, or procedures

**CONTENT REQUIREMENTS:**
- Provide clear, helpful explanations that enhance understanding
- Reference specific parts of the learning content when relevant
- Use practical examples and real-world analogies
- Break complex topics into digestible, well-organized sections
- Include actionable insights and learning tips when appropriate
- Be honest if something isn't covered in the provided content

Make every response visually engaging and easy to scan, like modern educational platforms.`
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getCachedResponse, addToCache } = useChatCache();
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [showLearningOutcomes, setShowLearningOutcomes] = useState<boolean>(false);
  const { user } = useAuth(); // Get user for tracking
  
  // Scroll to bottom of messages when new ones are added
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    if (messages.length) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Handle learning outcomes request
  const handleLearningOutcomesRequest = () => {
    // Get course topic from content or use the provided topic
    const extractedTopic = topic || content.split('\n')[0] || "this course";
    
    // Generate learning outcomes based on topic
    const outcomes = generateLearningOutcomes(extractedTopic);
    
    // Format the response with markdown
    const formattedOutcomes = `
## Learning Outcomes for ${extractedTopic}

${outcomes.map(outcome => `* ${outcome}`).join('\n')}

These learning outcomes are designed to measure your understanding and mastery of ${extractedTopic} concepts and applications.
    `;
    
    // Add learning outcomes as AI response
    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: formattedOutcomes,
      timestamp: new Date()
    };
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage, aiMessage]);
    setQuestion('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || isLoading) return;
    
    // Check if it's a learning outcomes request
    if (question.toLowerCase().includes('learning outcome') || 
        question.toLowerCase().includes('course objectives')) {
      handleLearningOutcomesRequest();
      return;
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');
    
    try {
      // Check cache first
      const cachedResponse = getCachedResponse(question, content, selectedModel);
      
      if (cachedResponse) {
        // Use cached response
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: cachedResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        setIsStreaming(false);
        return;
      }
      
      // Get streamed response from AI
      const controller = new AbortController();
      const response = await openRouterService.streamResponse(
        question, 
        content,
        selectedModel,
        systemPrompt,
        (chunk) => {
          setStreamingContent(prev => prev + chunk);
        },
        controller.signal,
        user?.id // Pass userId for tracking
      );
      
      // Add to cache
      addToCache(question, response, content, selectedModel);
      
      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I encountered an error processing your question. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[400px] overflow-y-auto space-y-4 mb-4 p-2 pr-1">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 flex flex-col items-center">
              <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-1">Ask questions about the content</h3>
              <p className="text-sm">Use this chat to ask questions about what you're learning or get help with assignments.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={() => setQuestion("What are the key concepts in this material?")}
                >
                  What are the key concepts?
                </Button>
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={() => setQuestion("Can you explain the learning outcomes for this course?")}
                >
                  Show learning outcomes
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className={message.role === "user" ? "bg-primary" : "bg-secondary"}>
                  <AvatarFallback>
                    {message.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                  {message.role === "assistant" && (
                    <AvatarImage src="/brain-icon.svg" alt="AI" />
                  )}
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-3 max-w-[85%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none text-foreground">
                      {(ReactMarkdown as any)({
                        remarkPlugins: [remarkGfm],
                        components: {
                          // ChatGPT-style headers (clean, professional)
                          h1: ({children}: any) => (
                            <h1 className="text-xl font-semibold mt-6 mb-4 text-foreground border-b border-border pb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({children}: any) => (
                            <h2 className="text-lg font-semibold mt-5 mb-3 text-foreground">
                              {children}
                            </h2>
                          ),
                          h3: ({children}: any) => (
                            <h3 className="text-base font-semibold mt-4 mb-2 text-foreground">
                              {children}
                            </h3>
                          ),
                          
                          // ChatGPT-style paragraphs
                          p: ({children}: any) => (
                            <p className="mb-4 text-sm leading-relaxed text-foreground">
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
                            <li className="text-sm leading-relaxed text-foreground list-disc">
                              {children}
                            </li>
                          ),
                          
                          // ChatGPT-style code
                          code: ({inline, children, ...props}: any) => (
                            inline 
                              ? <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground border" {...props}>
                                  {children}
                                </code>
                              : <code className="block bg-muted p-3 rounded-md text-xs font-mono text-foreground border my-2 overflow-x-auto" {...props}>
                                  {children}
                                </code>
                          ),
                          pre: ({children}: any) => (
                            <pre className="bg-muted rounded-md p-3 my-3 overflow-x-auto border">
                              {children}
                            </pre>
                          ),
                          
                          // ChatGPT-style blockquotes
                          blockquote: ({children}: any) => (
                            <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-3 italic text-foreground/80 bg-muted/30 rounded-r">
                              {children}
                            </blockquote>
                          ),
                          
                          // ChatGPT-style tables
                          table: ({children}: any) => (
                            <div className="overflow-x-auto my-4">
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
                            <th className="border border-border px-3 py-2 text-left font-medium text-xs">
                              {children}
                            </th>
                          ),
                          td: ({children}: any) => (
                            <td className="border border-border px-3 py-2 text-xs">
                              {children}
                            </td>
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
                          
                          // Links
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
                        },
                        children: message.content
                      })}
                    </div>
                  )}
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          {isStreaming && (
            <div className="flex gap-3">
              <Avatar className="bg-secondary">
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src="/brain-icon.svg" alt="AI" />
              </Avatar>
              <div className="rounded-lg px-4 py-3 bg-muted max-w-[85%]">
                <div className="prose prose-sm max-w-none text-foreground">
                  {(ReactMarkdown as any)({
                    remarkPlugins: [remarkGfm],
                    components: {
                      // ChatGPT-style headers (clean, professional)
                      h1: ({children}: any) => (
                        <h1 className="text-xl font-semibold mt-6 mb-4 text-foreground border-b border-border pb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({children}: any) => (
                        <h2 className="text-lg font-semibold mt-5 mb-3 text-foreground">
                          {children}
                        </h2>
                      ),
                      h3: ({children}: any) => (
                        <h3 className="text-base font-semibold mt-4 mb-2 text-foreground">
                          {children}
                        </h3>
                      ),
                      
                      // ChatGPT-style paragraphs
                      p: ({children}: any) => (
                        <p className="mb-4 text-sm leading-relaxed text-foreground">
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
                        <li className="text-sm leading-relaxed text-foreground list-disc">
                          {children}
                        </li>
                      ),
                      
                      // ChatGPT-style code
                      code: ({inline, children, ...props}: any) => (
                        inline 
                          ? <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground border" {...props}>
                              {children}
                            </code>
                          : <code className="block bg-muted p-3 rounded-md text-xs font-mono text-foreground border my-2 overflow-x-auto" {...props}>
                              {children}
                            </code>
                      ),
                      pre: ({children}: any) => (
                        <pre className="bg-muted rounded-md p-3 my-3 overflow-x-auto border">
                          {children}
                        </pre>
                      ),
                      
                      // ChatGPT-style blockquotes
                      blockquote: ({children}: any) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-3 italic text-foreground/80 bg-muted/30 rounded-r">
                          {children}
                        </blockquote>
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
                      
                      // Links
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
                    },
                    children: streamingContent
                  })}
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-100"></span>
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-200"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLearningOutcomes(!showLearningOutcomes)}
                className="flex items-center gap-1 text-xs h-8"
              >
                <ListChecks className="h-3.5 w-3.5" />
                Learning Outcomes
              </Button>
              <ModelSelector 
                value={selectedModel} 
                onChange={setSelectedModel} 
              />
            </div>
            <PromptEditor 
              systemPrompt={systemPrompt}
              onChange={setSystemPrompt}
            />
          </div>
          
          {showLearningOutcomes && (
            <div className="p-3 border rounded-md bg-muted/50 text-sm space-y-2 mb-1">
              <h4 className="font-medium flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                Learning Outcomes
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {generateLearningOutcomes(topic || "this course").map((outcome, i) => (
                  <li key={i} className="text-xs">{outcome}</li>
                ))}
              </ul>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              placeholder="Ask a question about this content..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[60px] flex-1"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && question.trim()) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button type="submit" disabled={isLoading || !question.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentChat;
