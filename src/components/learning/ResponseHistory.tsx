import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MessageSquare, FileText, HelpCircle, Zap } from 'lucide-react';
import { responseTracker, ModelResponse } from '@/services/responseTracker';
import { useAuth } from '@/hooks/use-auth';

export const ResponseHistory = () => {
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ModelResponse['responseType'] | 'all'>('all');
  const { user } = useAuth();

  useEffect(() => {
    loadResponses();
  }, [user, selectedType]);

  const loadResponses = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      let fetchedResponses: ModelResponse[];
      
      if (selectedType === 'all') {
        fetchedResponses = await responseTracker.getUserResponses(user.id, 50);
      } else {
        fetchedResponses = await responseTracker.getResponsesByType(user.id, selectedType, 30);
      }
      
      setResponses(fetchedResponses);
    } catch (error) {
      console.error('Error loading response history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTypeIcon = (type: ModelResponse['responseType']) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'content_generation':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      case 'explanation':
        return <Zap className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: ModelResponse['responseType']) => {
    switch (type) {
      case 'chat':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'content_generation':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'quiz':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'explanation':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please sign in to view your response history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          AI Response History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="content_generation">Content</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="explanation">Explain</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedType} className="mt-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading responses...</p>
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No responses found for this category.</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {responses.map((response) => (
                    <Card key={response.id} className="border-l-4 border-l-primary/30">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`${getTypeColor(response.responseType)} flex items-center gap-1`}>
                              {getTypeIcon(response.responseType)}
                              {response.responseType.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {response.model}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(response.timestamp)}
                          </div>
                        </div>
                        
                        {response.topic && (
                          <div className="mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {response.field && `${response.field} • `}{response.topic}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong className="text-primary">Prompt:</strong>
                            <p className="mt-1 text-muted-foreground truncate max-w-full">
                              {response.prompt}
                            </p>
                          </div>
                          
                          <div className="text-sm">
                            <strong className="text-primary">Response:</strong>
                            <p className="mt-1 text-muted-foreground truncate max-w-full">
                              {response.response.length > 150 ? response.response.substring(0, 150) + '...' : response.response}
                            </p>
                          </div>
                        </div>
                        
                        {response.metadata && (
                          <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                            {response.metadata.processingTime && (
                              <span className="mr-4">⏱️ {response.metadata.processingTime}ms</span>
                            )}
                            {response.metadata.responseLength && (
                              <span className="mr-4">📝 {response.metadata.responseLength} chars</span>
                            )}
                            {response.metadata.tokenCount && (
                              <span>🎯 ~{response.metadata.tokenCount} tokens</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Showing {responses.length} response{responses.length !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" size="sm" onClick={loadResponses}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseHistory;
