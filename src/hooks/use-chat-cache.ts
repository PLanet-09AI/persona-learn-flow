import { useState, useCallback } from 'react';

interface CachedResponse {
  question: string;
  response: string;
  content: string; // Store the content hash or identifier to ensure context relevance
  model: string;   // Store the model used for the response
}

interface UseChatCacheReturn {
  getCachedResponse: (question: string, content: string, model: string) => string | null;
  addToCache: (question: string, response: string, content: string, model: string) => void;
  clearCache: () => void;
}

export const useChatCache = (): UseChatCacheReturn => {
  // Store cached responses
  const [cachedResponses, setCachedResponses] = useState<CachedResponse[]>([]);
  
  // Get a normalized version of text for comparison (lowercase, trimmed)
  const normalizeText = (text: string): string => {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  };
  
  // Create a simple hash for the content to quickly compare contexts
  const getContentHash = (content: string): string => {
    // Take first 100 chars + last 100 chars as a simple fingerprint
    const text = content || '';
    if (text.length <= 200) return text;
    return text.slice(0, 100) + text.slice(-100);
  };
  
  // Get cached response if available
  const getCachedResponse = useCallback(
    (question: string, content: string, model: string): string | null => {
      const normalizedQuestion = normalizeText(question);
      const contentHash = getContentHash(content);
      
      // Find exact match for question + content + model
      const exactMatch = cachedResponses.find(
        (item) => 
          normalizeText(item.question) === normalizedQuestion && 
          item.content === contentHash &&
          item.model === model
      );
      
      if (exactMatch) {
        return exactMatch.response;
      }
      
      return null;
    },
    [cachedResponses]
  );
  
  // Add response to cache
  const addToCache = useCallback(
    (question: string, response: string, content: string, model: string): void => {
      setCachedResponses((prevResponses) => [
        ...prevResponses,
        {
          question,
          response,
          content: getContentHash(content),
          model
        }
      ]);
    },
    []
  );
  
  // Clear cache
  const clearCache = useCallback(() => {
    setCachedResponses([]);
  }, []);
  
  return {
    getCachedResponse,
    addToCache,
    clearCache
  };
};
