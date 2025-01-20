interface CachedUser {
  id: string;
  email: string | null;
  timestamp: number;
}

class AuthCache {
  private static cache = new Map<string, CachedUser>();
  private static TTL = 1000 * 60; // 1 minute TTL

  static set(requestId: string, user: CachedUser) {
    this.cache.set(requestId, {
      ...user,
      timestamp: Date.now(),
    });
  }

  static get(requestId: string): CachedUser | null {
    const cached = this.cache.get(requestId);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(requestId);
      return null;
    }

    return cached;
  }

  static clear(requestId: string) {
    this.cache.delete(requestId);
  }

  // Cleanup old entries periodically
  static cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

// Run cleanup every minute
setInterval(() => AuthCache.cleanup(), 60000);

export default AuthCache; 