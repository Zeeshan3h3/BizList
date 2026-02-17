const PQueue = require('p-queue').default;

/**
 * ============================================
 * ANTI-BAN RATE LIMITER & QUEUE SYSTEM
 * ============================================
 * 
 * Purpose: Prevent IP ban by limiting scraping rate
 * Created for: BizCheck by Zeeshan (Jadavpur University)
 * 
 * WHY DO WE NEED THIS? (IMPORTANT FOR INTERVIEWS)
 * - Google detects bots by analyzing request patterns
 * - If we scrape 100 times in 1 minute, we'll get IP banned
 * - This queue ensures MAXIMUM 1 scrape every 12 seconds
 * - Even if 50 users click at once, they wait in line (FIFO)
 * 
 * HOW IT WORKS:
 * 1. User submits audit request
 * 2. Request added to queue (in-memory array)
 * 3. Queue processes ONE request at a time
 * 4. After completion, waits 12 seconds before next request
 * 5. If queue has 20+ items, reject new requests (anti-DoS)
 * 
 * REAL-WORLD ANALOGY:
 * Think of it like a toll booth with ONE lane:
 * - Cars (requests) line up in order
 * - Only 1 car passes at a time
 * - Next car must wait 12 seconds after previous car
 * - If line is too long (20+ cars), new cars are turned away
 * 
 * LEARNING CONCEPTS:
 * - **Queue**: First In, First Out (FIFO) data structure
 * - **Concurrency**: How many tasks run simultaneously (we use 1)
 * - **Interval**: Minimum time between tasks (12 seconds)
 * - **Rate Limiting**: Controlling request frequency
 * - **Backpressure**: Rejecting requests when system is overloaded
 */

/**
 * Queue Configuration
 * 
 * These settings control how the queue processes scraping requests.
 * Adjust carefully - too aggressive = IP ban, too conservative = slow service
 */
const QUEUE_CONFIG = {
    /**
     * concurrency: Number of tasks that can run at the same time
     * - Set to 1 = only one browser/scrape active at once
     * - Why? Google can detect multiple parallel requests from same IP
     * - For scale: use multiple servers with different IPs, each with concurrency: 1
     */
    concurrency: 1,

    /**
     * interval: Minimum time (ms) between starting tasks
     * - 12000ms = 12 seconds
     * - Why 12 seconds? Based on testing, Google doesn't flag this rate
     * - Too fast (<10s) = higher ban risk
     * - Too slow (>20s) = users wait too long
     */
    interval: 12000,

    /**
     * intervalCap: Max tasks per interval
     * - Set to 1 = only 1 task can start per 12-second interval
     * - Combined with concurrency:1, ensures serial processing
     */
    intervalCap: 1,

    /**
     * timeout: Max time (ms) a single task can run
     * - 45000ms = 45 seconds
     * - If scraper takes longer, it's killed and returns error
     * - Prevents stuck requests from blocking the queue forever
     */
    timeout: 45000,

    /**
     * autoStart: Whether to process queue automatically
     * - true = queue starts processing as soon as items added
     * - false = need to manually call queue.start()
     */
    autoStart: true
};

// Create the queue instance
const scrapeQueue = new PQueue(QUEUE_CONFIG);

// Queue statistics (for monitoring)
let queueStats = {
    totalProcessed: 0,
    totalFailed: 0,
    currentQueueSize: 0,
    lastScrapeTime: null
};

/**
 * Add a scraping task to the queue
 * 
 * This is the main function called by the controller to schedule a scrape.
 * It adds the scraper function to the queue and waits for the result.
 * 
 * @param {Function} scraperFunction - The scraper function to execute (e.g., scrapeGoogleMaps)
 * @param {...any} args - Arguments to pass to the scraper (e.g., businessName, area)
 * @returns {Promise<Object>} Result of the scrape
 * 
 * INTERVIEW EXPLANATION:
 * "When a user requests an audit, we don't scrape immediately. Instead, we add
 * the request to a queue. The queue processes requests one at a time with a
 * 12-second delay between each. This prevents overwhelming Google Maps and
 * reduces the risk of IP bans. If too many requests pile up (20+), we reject
 * new ones to prevent system overload."
 */
async function addToQueue(scraperFunction, ...args) {
    // Calculate current queue size
    // size = waiting tasks, pending = currently executing task
    queueStats.currentQueueSize = scrapeQueue.size + scrapeQueue.pending;

    // Log for monitoring and debugging
    console.log(`[QUEUE] Adding task to queue. Current queue size: ${queueStats.currentQueueSize}`);

    /**
     * Anti-DoS Protection
     * 
     * If queue has 20+ items, reject new requests.
     * Why 20? Calculation:
     * - Each scrape takes ~15-20 seconds
     * - Plus 12 seconds interval
     * - 20 items = ~10 minutes wait time for last user
     * - Beyond this, users abandon the request anyway
     * 
     * This protects against:
     * - Accidental DoS (user clicking button repeatedly)
     * - Intentional DoS attacks
     * - Server resource exhaustion
     */
    if (queueStats.currentQueueSize > 20) {
        console.log('[QUEUE] Queue full, rejecting request');
        throw new Error('QUEUE_FULL: Too many requests. Please try again in a few minutes.');
    }

    // Add to queue and wait for result
    try {
        const result = await scrapeQueue.add(async () => {
            console.log(`[QUEUE] Processing scrape...`);

            // Execute the scraper
            const scraperResult = await scraperFunction(...args);

            // Update stats
            queueStats.totalProcessed++;
            queueStats.lastScrapeTime = new Date();
            queueStats.currentQueueSize = scrapeQueue.size + scrapeQueue.pending;

            if (!scraperResult.success) {
                queueStats.totalFailed++;
            }

            console.log(`[QUEUE] Scrape completed. Queue size: ${queueStats.currentQueueSize}`);

            return scraperResult;
        });

        return result;

    } catch (error) {
        queueStats.totalFailed++;
        console.error(`[QUEUE ERROR] ${error.message}`);

        throw new Error('QUEUE_ERROR: ' + error.message);
    }
}

/**
 * Get current queue statistics
 * Useful for admin dashboard or monitoring
 */
function getQueueStats() {
    return {
        ...queueStats,
        currentQueueSize: scrapeQueue.size + scrapeQueue.pending,
        isPaused: scrapeQueue.isPaused
    };
}

/**
 * Pause the queue (for maintenance)
 */
function pauseQueue() {
    scrapeQueue.pause();
    console.log('[QUEUE] Queue paused');
}

/**
 * Resume the queue
 */
function resumeQueue() {
    scrapeQueue.start();
    console.log('[QUEUE] Queue resumed');
}

/**
 * Clear all pending tasks (emergency use only)
 */
function clearQueue() {
    scrapeQueue.clear();
    console.log('[QUEUE] Queue cleared');
}

// Export the queue manager
module.exports = {
    addToQueue,
    getQueueStats,
    pauseQueue,
    resumeQueue,
    clearQueue,

    // Export queue instance for advanced usage
    queue: scrapeQueue
};
