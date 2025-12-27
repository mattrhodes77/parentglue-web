'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimId = searchParams.get('claim');
  const { setAuth } = useAuth();

  const [isLogin, setIsLogin] = useState(!claimId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/portal/login' : '/api/portal/register';
      const body = isLogin
        ? { email, password }
        : {
            email,
            password,
            business_name: businessName,
            contact_name: contactName,
            discovered_provider_id: claimId ? Number(claimId) : undefined,
          };

      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Store token
      localStorage.setItem('pg_token', data.token);
      setAuth(data);

      router.push('/portal');
    } catch (e) {
      setError('Failed to connect to server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[var(--color-teal-light)] rounded-full opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-[var(--color-coral)] rounded-full opacity-[0.08] blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-display text-3xl font-semibold text-[var(--color-teal)] mb-4">
            Parent<span className="text-[var(--color-coral)]">Glue</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-charcoal)]">
            {isLogin ? 'Welcome back' : claimId ? 'Claim your listing' : 'Create your account'}
          </h1>
          <p className="text-[var(--color-charcoal-light)] mt-2">
            {isLogin
              ? 'Sign in to manage your provider profile'
              : 'Join ParentGlue to connect with families'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[var(--shadow-medium)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your practice name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contact name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:outline-none"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-teal)] text-white font-semibold hover:bg-[var(--color-teal-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[var(--color-teal)] hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--color-charcoal-light)] mt-6">
          <Link href="/" className="hover:text-[var(--color-teal)]">
            ← Back to ParentGlue
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>}>
      <LoginForm />
    </Suspense>
  );
}
