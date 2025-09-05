import React, { useState, useEffect } from 'react';
import { requestQueue } from '@/services/requestQueue';
import { cacheService } from '@/services/cache';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, Zap, CheckCircle } from 'lucide-react';

export const QueueStatusIndicator: React.FC = () => {
  const [stats, setStats] = useState({
    queueLength: 0,
    isProcessing: false,
    totalProcessed: 0,
    recentRequestCount: 0,
    estimatedWaitTime: 0
  });

  const [cacheStats, setCacheStats] = useState<{
    size: number;
    totalEntries: number;
    oldestEntry?: number;
  }>({
    size: 0,
    totalEntries: 0,
    oldestEntry: undefined
  });

  useEffect(() => {
    const updateStats = () => {
      const queueStats = requestQueue.getStats();
      const cStats = cacheService.getStats();
      
      setStats({
        ...queueStats,
        estimatedWaitTime: requestQueue.getEstimatedWaitTime()
      });
      setCacheStats(cStats);
    };

    // Update stats initially
    updateStats();

    // Update stats every 2 seconds
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, []);

  if (stats.queueLength === 0 && !stats.isProcessing && stats.recentRequestCount === 0) {
    return null; // Don't show anything when idle
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 text-xs">
      {stats.queueLength > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {stats.queueLength} queued
          {stats.estimatedWaitTime > 0 && (
            <span className="ml-1 text-muted-foreground">
              (~{Math.round(stats.estimatedWaitTime)}s)
            </span>
          )}
        </Badge>
      )}

      {stats.isProcessing && (
        <Badge variant="default" className="flex items-center gap-1">
          <Zap className="h-3 w-3 animate-pulse" />
          Processing...
        </Badge>
      )}

      {stats.recentRequestCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {stats.recentRequestCount}/10 this minute
        </Badge>
      )}

      {cacheStats.size > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 text-green-600">
          <Database className="h-3 w-3" />
          {cacheStats.size} cached
        </Badge>
      )}
    </div>
  );
};

export default QueueStatusIndicator;
