// Request queue service to manage API calls and avoid rate limits
export interface QueuedRequest {
  id: string;
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  priority: number; // Lower number = higher priority
}

export class RequestQueueService {
  private queue: QueuedRequest[] = [];
  private processing: boolean = false;
  private requestCount: number = 0;
  private readonly MAX_REQUESTS_PER_MINUTE = 10; // Conservative limit
  private readonly REQUEST_INTERVAL = 6000; // 6 seconds between requests
  private requestTimestamps: number[] = [];

  /**
   * Add a request to the queue
   */
  async enqueue<T>(
    requestFn: () => Promise<T>,
    priority: number = 5,
    requestId?: string
  ): Promise<T> {
    console.log(`📋 Adding request to queue with priority ${priority}`);
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fn: requestFn,
        resolve,
        reject,
        timestamp: Date.now(),
        priority
      };

      // Insert based on priority (lower number = higher priority)
      let insertIndex = this.queue.length;
      for (let i = 0; i < this.queue.length; i++) {
        if (this.queue[i].priority > priority) {
          insertIndex = i;
          break;
        }
      }

      this.queue.splice(insertIndex, 0, request);
      console.log(`📋 Queued request ${request.id} (priority: ${priority}, queue size: ${this.queue.length})`);

      // Start processing if not already processing
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`🔄 Starting queue processing with ${this.queue.length} requests`);

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      
      try {
        // Check rate limits
        await this.enforceRateLimit();
        
        console.log(`⚡ Processing request ${request.id}`);
        const result = await request.fn();
        request.resolve(result);
        
        // Track successful request
        this.requestTimestamps.push(Date.now());
        this.requestCount++;
        
        console.log(`✅ Completed request ${request.id} (${this.queue.length} remaining)`);
        
      } catch (error) {
        console.error(`❌ Request ${request.id} failed:`, error);
        request.reject(error);
      }

      // Clean up old timestamps (older than 1 minute)
      this.cleanupTimestamps();
    }

    this.processing = false;
    console.log(`🏁 Queue processing completed`);
  }

  /**
   * Enforce rate limiting by waiting if necessary
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000; // 1 minute ago

    // Count requests in the last minute
    const recentRequests = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);

    if (recentRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = oldestRequest + 60000 - now + 1000; // Wait until oldest request is >1 minute old + buffer
      
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached. Waiting ${Math.round(waitTime / 1000)}s before next request`);
        await this.delay(waitTime);
      }
    }

    // Also enforce minimum interval between requests
    if (this.requestTimestamps.length > 0) {
      const lastRequestTime = this.requestTimestamps[this.requestTimestamps.length - 1];
      const timeSinceLastRequest = now - lastRequestTime;
      
      if (timeSinceLastRequest < this.REQUEST_INTERVAL) {
        const waitTime = this.REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`⏱️ Enforcing request interval. Waiting ${Math.round(waitTime / 1000)}s`);
        await this.delay(waitTime);
      }
    }
  }

  /**
   * Clean up old request timestamps
   */
  private cleanupTimestamps(): void {
    const oneMinuteAgo = Date.now() - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
  }

  /**
   * Utility function to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueLength: number;
    isProcessing: boolean;
    totalProcessed: number;
    recentRequestCount: number;
  } {
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequestCount = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo).length;

    return {
      queueLength: this.queue.length,
      isProcessing: this.processing,
      totalProcessed: this.requestCount,
      recentRequestCount
    };
  }

  /**
   * Clear the queue (useful for emergencies)
   */
  clearQueue(): void {
    // Reject all pending requests
    for (const request of this.queue) {
      request.reject(new Error('Queue cleared'));
    }
    this.queue = [];
    console.log('🗑️ Queue cleared');
  }

  /**
   * Get estimated wait time for a new request
   */
  getEstimatedWaitTime(): number {
    const stats = this.getStats();
    if (stats.queueLength === 0) return 0;
    
    // Rough estimate: queue length * request interval
    return stats.queueLength * (this.REQUEST_INTERVAL / 1000);
  }
}

export const requestQueue = new RequestQueueService();
