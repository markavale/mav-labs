'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading || retryAfter > 0) return;

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      if (res.status === 429) {
        const seconds = data.retryAfter || 60;
        setRetryAfter(seconds);
        setError(`Too many attempts. Try again in ${seconds}s`);
        startCountdown(seconds);
        return;
      }

      setError(data.error || 'Invalid password');
      setPassword('');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function startCountdown(seconds: number) {
    let remaining = seconds;
    const interval = setInterval(() => {
      remaining -= 1;
      setRetryAfter(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setError('');
      } else {
        setError(`Too many attempts. Try again in ${remaining}s`);
      }
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
            <div
              className="absolute inset-[-3px] rounded-full animate-pace-breathe"
              style={{
                boxShadow: '0 0 24px 4px rgba(34, 211, 238, 0.3)',
              }}
            />
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ border: '2px solid rgba(34, 211, 238, 0.5)' }}
            >
              <img
                src="/pace-avatar.png"
                alt="Pace"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'top center' }}
                draggable={false}
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold gradient-text mb-1">PACE AI</h1>
          <p className="text-text-muted text-sm">Personal AI Cognitive Engine</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-text-muted" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoFocus
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-10 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan/50 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-status-error bg-status-error/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password || retryAfter > 0}
              className="w-full py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-brand-cyan text-dark-bg hover:bg-brand-cyan/90 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:ring-offset-2 focus:ring-offset-dark-bg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-xs font-mono mt-6">
          MAV Labs &middot; Secured Access
        </p>
      </div>
    </div>
  );
}
