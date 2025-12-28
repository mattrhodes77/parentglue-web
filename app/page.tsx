'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Heart, Clock, Shield, Users, ArrowRight, Sparkles, Building2, MapPin } from 'lucide-react';
import { PROVIDER_TYPES, US_STATES } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [providerType, setProviderType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city && state && providerType) {
      router.push(`/search?city=${encodeURIComponent(city)}&state=${state}&provider_type=${providerType}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-cream)]/80 backdrop-blur-md border-b border-[var(--color-cream-dark)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-semibold text-[var(--color-teal)]">
            Parent<span className="text-[var(--color-coral)]">Glue</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/search" className="text-sm font-medium text-[var(--color-charcoal)] hover:text-[var(--color-teal)] transition-colors">
              Find Providers
            </Link>
            <Link href="/offices" className="text-sm font-medium text-[var(--color-charcoal)] hover:text-[var(--color-teal)] transition-colors">
              DD Offices
            </Link>
            <Link
              href="/portal/login"
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] transition-colors"
            >
              Provider Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[var(--color-teal-light)] rounded-full opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-coral)] rounded-full opacity-[0.08] blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="animate-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal-dark)] text-sm font-medium mb-6">
              <MapPin size={16} />
              Nationwide coverage — all 50 states
            </span>
          </div>

          <h1 className="animate-in delay-100 font-display text-5xl md:text-6xl font-semibold text-[var(--color-charcoal)] leading-tight mb-6">
            Find the right support for your{' '}
            <span className="text-[var(--color-teal)]">child&apos;s</span> unique journey
          </h1>

          <p className="animate-in delay-200 text-xl text-[var(--color-charcoal-light)] max-w-2xl mx-auto mb-6">
            Connect with ABA therapists, speech therapists, developmental specialists, and advocates anywhere in the US. No more endless searching.
          </p>

          <div className="animate-in delay-250 flex flex-wrap justify-center gap-8 mb-10 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-teal)]">50</p>
              <p className="text-[var(--color-charcoal-light)]">States</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-teal)]">370+</p>
              <p className="text-[var(--color-charcoal-light)]">Regional Offices</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-teal)]">10</p>
              <p className="text-[var(--color-charcoal-light)]">Provider Types</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="animate-in delay-300 bg-white rounded-2xl shadow-[var(--shadow-medium)] p-6 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:outline-none transition-colors bg-white"
                  required
                >
                  <option value="">Select...</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">Service Type</label>
                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:outline-none transition-colors bg-white"
                  required
                >
                  <option value="">Select...</option>
                  {PROVIDER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-teal)] text-white font-semibold hover:bg-[var(--color-teal-dark)] transition-colors"
                >
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-semibold text-center text-[var(--color-charcoal)] mb-4">
            We hold everything together
          </h2>
          <p className="text-center text-[var(--color-charcoal-light)] max-w-2xl mx-auto mb-12">
            Navigating autism services is overwhelming. ParentGlue brings it all together so you can focus on what matters most.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Skip the waitlist hunt',
                description: 'See which providers are accepting new clients right now, with real availability info.',
                color: 'var(--color-teal)',
              },
              {
                icon: Shield,
                title: 'Verified providers',
                description: 'Every listed provider is verified. No more guessing about credentials or quality.',
                color: 'var(--color-coral)',
              },
              {
                icon: Heart,
                title: 'Parent-reviewed',
                description: 'Real feedback from families who understand your journey and priorities.',
                color: 'var(--color-sage)',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="animate-in p-6 rounded-2xl bg-[var(--color-cream)] hover:shadow-[var(--shadow-soft)] transition-shadow"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon size={24} style={{ color: item.color }} />
                </div>
                <h3 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-2">
                  {item.title}
                </h3>
                <p className="text-[var(--color-charcoal-light)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Providers */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-teal-dark)] p-10 text-white">
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[var(--color-coral)]/30 rounded-full blur-2xl" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users size={20} />
                  <span className="text-sm font-medium text-white/80">For Providers</span>
                </div>
                <h2 className="font-display text-3xl font-semibold mb-3">
                  Connect with families who need you
                </h2>
                <p className="text-white/80 max-w-lg">
                  Claim your free listing, showcase your expertise, and let parents find you when they need help most.
                </p>
              </div>
              <Link
                href="/portal/login"
                className="flex items-center gap-2 px-8 py-4 bg-white text-[var(--color-teal-dark)] font-semibold rounded-xl hover:bg-[var(--color-cream)] transition-colors shrink-0"
              >
                Claim Your Listing
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--color-cream-dark)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-xl font-semibold text-[var(--color-teal)]">
            Parent<span className="text-[var(--color-coral)]">Glue</span>
          </div>
          <p className="text-sm text-[var(--color-charcoal-light)]">
            Helping families navigate autism services with confidence.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/offices" className="text-[var(--color-charcoal-light)] hover:text-[var(--color-teal)]">
              DD Offices
            </Link>
            <Link href="/resources" className="text-[var(--color-charcoal-light)] hover:text-[var(--color-teal)]">
              Resources
            </Link>
            <Link href="/portal/login" className="text-[var(--color-charcoal-light)] hover:text-[var(--color-teal)]">
              Provider Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
