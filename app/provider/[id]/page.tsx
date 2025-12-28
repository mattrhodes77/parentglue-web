'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Globe, Clock, Users, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { getProvider, getProviderLeadStats } from '@/lib/api';
import { ContactButton } from '@/components/providers/ContactButton';
import { ClaimBanner } from '@/components/providers/ClaimBanner';
import { AddToCalendarButton } from '@/components/providers/AddToCalendarButton';
import { InquiryForm } from '@/components/providers/InquiryForm';

export default function ProviderPage() {
  const params = useParams();
  const id = Number(params.id);
  const [provider, setProvider] = useState<any>(null);
  const [leadStats, setLeadStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, stats] = await Promise.all([
          getProvider(id),
          getProviderLeadStats(id),
        ]);
        setProvider(p);
        setLeadStats(stats);
      } catch (e) {
        console.error('Failed to load provider:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-teal)]" size={40} />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="font-display text-2xl mb-4">Provider not found</h1>
        <Link href="/search" className="text-[var(--color-teal)]">Back to search</Link>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    aba_therapy: 'ABA Therapy',
    speech_therapy: 'Speech Therapy',
    occupational_therapy: 'Occupational Therapy',
    developmental_pediatrician: 'Developmental Pediatrician',
    neuropsychologist: 'Neuropsychologist',
    iep_advocate: 'IEP Advocate',
    special_ed_attorney: 'Special Ed Attorney',
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="bg-white border-b border-[var(--color-cream-dark)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-semibold text-[var(--color-teal)]">
            Parent<span className="text-[var(--color-coral)]">Glue</span>
          </Link>
          <Link href="/search" className="flex items-center gap-2 text-sm text-[var(--color-charcoal-light)] hover:text-[var(--color-teal)]">
            <ArrowLeft size={16} />
            Back to search
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Claim Banner if unclaimed */}
        {leadStats && !leadStats.is_claimed && (
          <div className="mb-8">
            <ClaimBanner providerId={id} leadsLast30Days={leadStats.leads_last_30_days || 0} />
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-semibold text-[var(--color-charcoal)]">
                  {provider.name}
                </h1>
                {provider.verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-[var(--color-success)]/20 text-[#4A7A5A]">
                    <CheckCircle size={14} />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal-dark)]">
                  {typeLabels[provider.provider_type] || provider.provider_type}
                </span>
                {provider.accepting_new_clients && (
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-[var(--color-coral)]/20 text-[#8B5A3C]">
                    Accepting New Clients
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-[var(--color-charcoal-light)]">
              <MapPin size={18} />
              <span>{provider.address || `${provider.city}, ${provider.state}`}</span>
            </div>
            {provider.waitlist_weeks && (
              <div className="flex items-center gap-2 text-[var(--color-charcoal-light)]">
                <Clock size={18} />
                <span>{provider.waitlist_weeks} week waitlist</span>
              </div>
            )}
          </div>

          {/* Contact buttons */}
          <div className="flex flex-wrap gap-3">
            {provider.phone && (
              <ContactButton providerId={id} type="phone" value={provider.phone} sourcePage="provider_profile" />
            )}
            {provider.website && (
              <ContactButton providerId={id} type="website" value={provider.website} sourcePage="provider_profile" />
            )}
            {provider.consultation_booking_url && (
              <ContactButton providerId={id} type="booking" value={provider.consultation_booking_url} sourcePage="provider_profile" />
            )}
            <AddToCalendarButton
              providerName={provider.name}
              providerAddress={provider.address || `${provider.city}, ${provider.state}`}
            />
          </div>
        </div>

        {/* Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {provider.description && (
            <div className="md:col-span-2 bg-white rounded-2xl shadow-[var(--shadow-soft)] p-6">
              <h2 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-3">About</h2>
              <p className="text-[var(--color-charcoal-light)] whitespace-pre-wrap">{provider.description}</p>
            </div>
          )}

          {provider.specialties && provider.specialties.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-6">
              <h2 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-3">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {provider.specialties.map((s: string) => (
                  <span key={s} className="px-3 py-1 text-sm rounded-lg bg-[var(--color-cream)] text-[var(--color-charcoal)]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {provider.ages_served && provider.ages_served.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-6">
              <h2 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-3">Ages Served</h2>
              <div className="flex flex-wrap gap-2">
                {provider.ages_served.map((a: string) => (
                  <span key={a} className="px-3 py-1 text-sm rounded-lg bg-[var(--color-cream)] text-[var(--color-charcoal)]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {provider.insurance_accepted && provider.insurance_accepted.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-6">
              <h2 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-3">Insurance Accepted</h2>
              <div className="flex flex-wrap gap-2">
                {provider.insurance_accepted.map((i: string) => (
                  <span key={i} className="px-3 py-1 text-sm rounded-lg bg-[var(--color-cream)] text-[var(--color-charcoal)]">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {provider.languages && provider.languages.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-6">
              <h2 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-3">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {provider.languages.map((l: string) => (
                  <span key={l} className="px-3 py-1 text-sm rounded-lg bg-[var(--color-cream)] text-[var(--color-charcoal)]">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inquiry Form */}
        <div className="mt-8">
          <InquiryForm providerId={id} providerName={provider.name} />
        </div>
      </div>
    </div>
  );
}
