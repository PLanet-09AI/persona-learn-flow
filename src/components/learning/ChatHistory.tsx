import { useState, useEffect } from "react";
import { Clock, MessageCircle, Trash2, X, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { chatHistoryService, Conversation } from "@/services/chatHistory";
import { ChatMessage } from "@/types/chat";
import { useAuth } from "@/hooks/use-auth";

interface ChatHistoryProps {
  onSelectConversation?: (conversation: Conversation) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export const ChatHistory = ({ onSelectConversation, onClose, isOpen }: ChatHistoryProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  // Load conversations on mount and when user changes
  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = () => {
    if (user) {
      const userConversations = chatHistoryService.getUserConversations(user.id);
      setConversations(userConversations);
    } else {
      setConversations([]);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    onSelectConversation?.(conversation);
  };

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    
    if (confirm('Are you sure you want to delete this conversation?')) {
      chatHistoryService.deleteConversation(conversationId);
      loadConversations();
      
      // If the deleted conversation was selected, clear selection
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessagePreview = (messages: ChatMessage[]): string => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      return lastUserMessage.content.length > 60 
        ? lastUserMessage.content.substring(0, 60) + '...'
        : lastUserMessage.content;
    }
    return 'No messages';
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat History
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start chatting to see your history here
              </p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {conversations.map((conversation, index) => (
                <div key={conversation.id}>
                  <div
                    className={`
                      group relative p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50
                      ${selectedConversationId === conversation.id ? 'bg-accent' : ''}
                    `}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate mb-1">
                          {conversation.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {getMessagePreview(conversation.messages)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(conversation.updatedAt)}</span>
                          {conversation.topic && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-20">{conversation.topic}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {conversation.messages.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {selectedConversationId === conversation.id && (
                      <ChevronRight className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  {index < conversations.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
