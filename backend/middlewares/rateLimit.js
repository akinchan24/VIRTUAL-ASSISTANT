const requests = new Map()

const assistantRateLimit = (req,res,next) => {
    const now = Date.now()
    const windowStart = now - 60 * 1000
    const key = req.ip
    const recentRequests = (requests.get(key) || []).filter(timestamp => timestamp > windowStart)

    if (recentRequests.length >= 30) {
        return res.status(429).json({response:"Too many requests. Please try again in a minute."})
    }

    recentRequests.push(now)
    requests.set(key,recentRequests)
    return next()
}

export default assistantRateLimit