'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Building2, MapPin, Phone, Mail, Globe, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { getStateAgency, getRegionalOffices, StateAgency, RegionalOffice } from '@/lib/api';

const OFFICE_TYPE_LABELS: Record<string, string> = {
  regional_center: 'Regional Center',
  lidda: 'Local IDD Authority',
  county_board: 'County Board',
  csb: 'Community Services Board',
  cmhsp: 'Community Mental Health',
  mh_id_office: 'MH/ID Office',
  dds_area_office: 'DDS Area Office',
  ddd_region: 'DDD Regional Office',
  state_agency: 'State Agency',
};

export default function StateOfficesPage() {
  const params = useParams();
  const stateCode = (params.state as string).toUpperCase();

  const [loading, setLoading] = useState(true);
  const [stateAgency, setStateAgency] = useState<StateAgency | null>(null);
  const [offices, setOffices] = useState<RegionalOffice[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [agency, officesData] = await Promise.all([
          getStateAgency(stateCode),
          getRegionalOffices({ state: stateCode, limit: 100 }),
        ]);
        setStateAgency(agency);
        setOffices(officesData);
      } catch (e) {
        console.error('Failed to load state offices:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [stateCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-teal)]" size={40} />
      </div>
    );
  }

  if (!stateAgency) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="font-display text-2xl mb-4">State not found</h1>
        <Link href="/offices" className="text-[var(--color-teal)]">Back to directory</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-cream-dark)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/offices"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-charcoal-light)] hover:text-[var(--color-teal)] mb-4"
          >
            <ArrowLeft size={16} />
            All States
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-[var(--color-charcoal)]">
                {stateAgency.state_name}
              </h1>
              <p className="text-[var(--color-charcoal-light)]">
                {stateAgency.agency_name}
              </p>
            </div>
            <span className="text-xl font-bold px-3 py-1 rounded-lg bg-[var(--color-teal)]/10 text-[var(--color-teal)]">
              {stateAgency.state}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            {stateAgency.phone && (
              <a
                href={`tel:${stateAgency.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-teal)] text-white text-sm font-medium hover:bg-[var(--color-teal-dark)] transition-colors"
              >
                <Phone size={16} />
                {stateAgency.phone}
              </a>
            )}
            {stateAgency.website && (
              <a
                href={stateAgency.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[var(--color-cream-dark)] text-[var(--color-charcoal)] text-sm font-medium hover:bg-[var(--color-cream)] transition-colors"
              >
                <Globe size={16} />
                Visit Website
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Regional Offices */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-4">
          Regional Offices ({offices.length})
        </h2>

        {offices.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Building2 size={48} className="mx-auto mb-4 text-[var(--color-cream-dark)]" />
            <p className="text-[var(--color-charcoal-light)]">
              This state has a centralized agency without regional offices.
              Contact the state agency directly for assistance.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {offices.map((office) => (
              <Link
                key={office.id}
                href={`/offices/${stateCode.toLowerCase()}/${office.id}`}
                className="block bg-white rounded-xl p-5 shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg font-semibold text-[var(--color-charcoal)] group-hover:text-[var(--color-teal)] transition-colors truncate">
                        {office.name}
                      </h3>
                    </div>

                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-[var(--color-cream)] text-[var(--color-charcoal-light)] mb-3">
                      {OFFICE_TYPE_LABELS[office.office_type] || office.office_type}
                    </span>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-charcoal-light)]">
                      {office.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {office.city}, {office.state}
                        </span>
                      )}
                      {office.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {office.phone}
                        </span>
                      )}
                    </div>

                    {office.services_offered && office.services_offered.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {office.services_offered.slice(0, 3).map((service) => (
                          <span
                            key={service}
                            className="px-2 py-0.5 text-xs rounded bg-[var(--color-teal)]/10 text-[var(--color-teal-dark)]"
                          >
                            {service}
                          </span>
                        ))}
                        {office.services_offered.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-[var(--color-charcoal-light)]">
                            +{office.services_offered.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <ChevronRight size={20} className="text-[var(--color-charcoal-light)] group-hover:text-[var(--color-teal)] transition-colors flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
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
