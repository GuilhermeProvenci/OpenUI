import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Returns true if rate limited (should block the request).
 * @param key - Unique key for the rate limit (e.g., `vote:${userId}`)
 * @param limit - Max number of requests in the window
 * @param windowSeconds - Time window in seconds
 */
export async function rateLimit(
    key: string,
    limit: number,
    windowSeconds: number
): Promise<boolean> {
    const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    })
    const { success } = await ratelimit.limit(key)
    return !success
}
