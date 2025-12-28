'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Building2, MapPin, Phone, ExternalLink } from 'lucide-react';
import { getStateAgencies, getOfficeStats, StateAgency, OfficeStats } from '@/lib/api';

export default function OfficesPage() {
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<StateAgency[]>([]);
  const [stats, setStats] = useState<OfficeStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statesData, statsData] = await Promise.all([
          getStateAgencies(),
          getOfficeStats(),
        ]);
        setStates(statesData);
        setStats(statsData);
      } catch (e) {
        console.error('Failed to load offices:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-teal)]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-cream-dark)]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={32} className="text-[var(--color-teal)]" />
            <h1 className="font-display text-3xl font-semibold text-[var(--color-charcoal)]">
              DD Office Directory
            </h1>
          </div>
          <p className="text-[var(--color-charcoal-light)] max-w-2xl">
            Find your state's developmental disabilities agency and regional offices.
            These offices provide services, support, and resources for individuals with developmental disabilities and their families.
          </p>

          {stats && (
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-teal)]">{stats.state_agencies}</p>
                <p className="text-sm text-[var(--color-charcoal-light)]">State Agencies</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-teal)]">{stats.regional_offices}</p>
                <p className="text-sm text-[var(--color-charcoal-light)]">Regional Offices</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-teal)]">{stats.county_mappings.toLocaleString()}</p>
                <p className="text-sm text-[var(--color-charcoal-light)]">Counties Covered</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* State Grid */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map((state) => (
            <Link
              key={state.state}
              href={`/offices/${state.state.toLowerCase()}`}
              className="bg-white rounded-xl p-5 shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[var(--color-charcoal)] group-hover:text-[var(--color-teal)] transition-colors">
                    {state.state_name}
                  </h2>
                  <p className="text-sm text-[var(--color-charcoal-light)] line-clamp-1">
                    {state.agency_name}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--color-cream)] text-[var(--color-charcoal)]">
                  {state.state}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                {state.phone && (
                  <span className="flex items-center gap-1 text-[var(--color-charcoal-light)]">
                    <Phone size={14} />
                    {state.phone}
                  </span>
                )}
                {state.website && (
                  <span className="flex items-center gap-1 text-[var(--color-teal)]">
                    <ExternalLink size={14} />
                    Website
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="mobile-nav">
        <Link href="/timeline" className="nav-item">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Timeline
        </Link>
        <Link href="/search" className="nav-item">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Providers
        </Link>
        <Link href="/offices" className="nav-item active">
          <Building2 size={24} />
          Offices
        </Link>
        <Link href="/resources" className="nav-item">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Resources
        </Link>
      </nav>
    </div>
  );
}
