import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizonal, Bot } from "lucide-react";
import { ChatMessage, chatWithAI } from "@/services/chat";
import { UserProfile } from "@/components/learning/LearningDashboard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@/styles/markdown.css";

interface ChatInterfaceProps {
  content: string;
  userProfile: UserProfile;
}

export const ChatInterface = ({ content, userProfile }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello! I'm your AI learning assistant for ${userProfile.field}. Feel free to ask me any questions about the content we've covered. How can I help you?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [userProfile.field, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      const response = await chatWithAI({
        question: inputValue,
        content: content,
        learningStyle: userProfile.learningStyle,
        field: userProfile.field
      });
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="bg-primary/10 p-3 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Chat with AI Assistant
        </h3>
      </div>
      
      {/* Messages area */}
      <ScrollArea className="flex-1 p-3 max-h-[300px]">
        <div className="space-y-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    {(ReactMarkdown as any)({
                      remarkPlugins: [remarkGfm],
                      components: {
                        // Enhanced styling for chat interface
                        h1: ({children}: any) => (
                          <h1 className="text-base font-bold mt-3 mb-2 text-primary">
                            {children}
                          </h1>
                        ),
                        h2: ({children}: any) => (
                          <h2 className="text-sm font-semibold mt-2 mb-1 text-primary">
                            {children}
                          </h2>
                        ),
                        h3: ({children}: any) => (
                          <h3 className="text-sm font-medium mt-2 mb-1 text-foreground">
                            {children}
                          </h3>
                        ),
                        p: ({children}: any) => (
                          <p className="mb-2 text-sm leading-relaxed">
                            {children}
                          </p>
                        ),
                        ul: ({children}: any) => (
                          <ul className="space-y-1 mb-2 ml-4 list-none">
                            {children}
                          </ul>
                        ),
                        li: ({children}: any) => (
                          <li className="flex items-start gap-1 text-sm">
                            <span className="text-primary mt-1 text-xs">•</span>
                            <span className="flex-1">{children}</span>
                          </li>
                        ),
                        code: ({inline, children, ...props}: any) => (
                          inline 
                            ? <code className="bg-secondary/70 text-primary px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                {children}
                              </code>
                            : <code className="block bg-secondary/30 p-2 rounded text-xs font-mono" {...props}>
                                {children}
                              </code>
                        ),
                        strong: ({children}: any) => (
                          <strong className="font-semibold text-primary">
                            {children}
                          </strong>
                        ),
                        em: ({children}: any) => (
                          <em className="italic text-foreground/80">
                            {children}
                          </em>
                        ),
                      },
                      children: message.content
                    })}
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <div 
                  className={`text-xs mt-1 ${
                    message.role === "user" 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              {message.role === "user" && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-secondary">You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {isLoading && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <Separator />
      
      {/* Input area */}
      <div className="p-3 flex gap-2">
        <Input
          placeholder="Ask me anything about this content..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          size="icon"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
