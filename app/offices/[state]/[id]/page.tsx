'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Building2, MapPin, Phone, Mail, Globe, Clock,
  ArrowLeft, FileText, Users, CheckCircle, AlertCircle
} from 'lucide-react';
import { getOfficeDetail, RegionalOffice } from '@/lib/api';

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

export default function OfficeDetailPage() {
  const params = useParams();
  const stateCode = (params.state as string).toUpperCase();
  const officeId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState<RegionalOffice | null>(null);
  const [counties, setCounties] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOfficeDetail(officeId);
        setOffice(data.office);
        setCounties(data.counties_served);
      } catch (e) {
        console.error('Failed to load office:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [officeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-teal)]" size={40} />
      </div>
    );
  }

  if (!office) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="font-display text-2xl mb-4">Office not found</h1>
        <Link href={`/offices/${stateCode.toLowerCase()}`} className="text-[var(--color-teal)]">
          Back to {stateCode} offices
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-cream-dark)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href={`/offices/${stateCode.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-charcoal-light)] hover:text-[var(--color-teal)] mb-4"
          >
            <ArrowLeft size={16} />
            Back to {stateCode}
          </Link>

          <h1 className="font-display text-2xl font-semibold text-[var(--color-charcoal)] mb-2">
            {office.name}
          </h1>

          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-[var(--color-cream)] text-[var(--color-charcoal-light)] mb-4">
            {OFFICE_TYPE_LABELS[office.office_type] || office.office_type}
          </span>

          {/* Contact Buttons */}
          <div className="flex flex-wrap gap-3">
            {office.phone && (
              <a
                href={`tel:${office.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-teal)] text-white text-sm font-medium hover:bg-[var(--color-teal-dark)] transition-colors"
              >
                <Phone size={16} />
                Call Main
              </a>
            )}
            {office.intake_phone && office.intake_phone !== office.phone && (
              <a
                href={`tel:${office.intake_phone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-coral)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Phone size={16} />
                Call Intake
              </a>
            )}
            {office.website && (
              <a
                href={office.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[var(--color-cream-dark)] text-[var(--color-charcoal)] text-sm font-medium hover:bg-[var(--color-cream)] transition-colors"
              >
                <Globe size={16} />
                Website
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-lg font-semibold text-[var(--color-charcoal)] mb-4">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {office.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[var(--color-teal)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-charcoal-light)]">Address</p>
                  <p className="text-[var(--color-charcoal)]">
                    {office.address}<br />
                    {office.city}, {office.state} {office.zip}
                  </p>
                </div>
              </div>
            )}
            {office.phone && (
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-[var(--color-teal)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-charcoal-light)]">Phone</p>
                  <p className="text-[var(--color-charcoal)]">{office.phone}</p>
                </div>
              </div>
            )}
            {office.email && (
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-[var(--color-teal)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-charcoal-light)]">Email</p>
                  <a href={`mailto:${office.email}`} className="text-[var(--color-teal)] hover:underline">
                    {office.email}
                  </a>
                </div>
              </div>
            )}
            {office.hours && (
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-[var(--color-teal)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-charcoal-light)]">Hours</p>
                  <p className="text-[var(--color-charcoal)]">{office.hours}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        {office.services_offered && office.services_offered.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-lg font-semibold text-[var(--color-charcoal)] mb-4">
              Services Offered
            </h2>
            <div className="flex flex-wrap gap-2">
              {office.services_offered.map((service) => (
                <span
                  key={service}
                  className="px-3 py-1 text-sm rounded-lg bg-[var(--color-teal)]/10 text-[var(--color-teal-dark)]"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility */}
        {(office.eligibility_summary || office.age_range || office.diagnosis_requirements) && (
          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-lg font-semibold text-[var(--color-charcoal)] mb-4">
              Eligibility
            </h2>
            <div className="space-y-4">
              {office.eligibility_summary && (
                <p className="text-[var(--color-charcoal-light)]">{office.eligibility_summary}</p>
              )}
              {office.age_range && (
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[var(--color-teal)]" />
                  <span className="text-sm"><strong>Ages:</strong> {office.age_range}</span>
                </div>
              )}
              {office.diagnosis_requirements && (
                <div className="p-4 rounded-lg bg-[var(--color-cream)]">
                  <p className="text-sm text-[var(--color-charcoal)]">
                    <strong>Diagnosis Requirements:</strong> {office.diagnosis_requirements}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application Process */}
        {(office.application_process || office.required_documents) && (
          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-lg font-semibold text-[var(--color-charcoal)] mb-4">
              How to Apply
            </h2>
            {office.self_referral_allowed !== null && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-4 ${
                office.self_referral_allowed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {office.self_referral_allowed ? (
                  <>
                    <CheckCircle size={16} />
                    Self-referral allowed
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    Referral required
                  </>
                )}
              </div>
            )}
            {office.application_process && (
              <p className="text-[var(--color-charcoal-light)] mb-4 whitespace-pre-line">
                {office.application_process}
              </p>
            )}
            {office.required_documents && office.required_documents.length > 0 && (
              <div>
                <h3 className="font-medium text-[var(--color-charcoal)] mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-[var(--color-teal)]" />
                  Required Documents
                </h3>
                <ul className="list-disc list-inside space-y-1 text-[var(--color-charcoal-light)]">
                  {office.required_documents.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {(office.typical_wait_time || office.assessment_timeline || office.service_start_timeline) && (
          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-lg font-semibold text-[var(--color-charcoal)] mb-4">
              Expected Timeline
            </h2>
            <div className="space-y-3">
              {office.typical_wait_time && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center text-[var(--color-teal)] font-bold text-sm">1</div>
                  <div>
                    <p className="font-medium text-[var(--color-charcoal)]">Initial Contact</p>
                    <p className="text-sm text-[var(--color-charcoal-light)]">{office.typical_wait_time}</p>
                  </div>
                </div>
              )}
              {office.assessment_timeline && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center text-[var(--color-teal)] font-bold text-sm">2</div>
                  <div>
                    <p className="font-medium text-[var(--color-charcoal)]">Assessment</p>
                    <p className="text-sm text-[var(--color-charcoal-light)]">{office.assessment_timeline}</p>
                  </div>
                </div>
              )}
              {office.service_start_timeline && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center text-[var(--color-teal)] font-bold text-sm">3</div>
                  <div>
                    <p className="font-medium text-[var(--color-charcoal)]">Services Begin</p>
                    <p className="text-sm text-[var(--color-charcoal-light)]">{office.service_start_timeline}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Counties Served */}
        {counties.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-lg font-semibold text-[var(--color-charcoal)] mb-4">
              Counties Served ({counties.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {counties.map((county) => (
                <span
                  key={county}
                  className="px-3 py-1 text-sm rounded-lg bg-[var(--color-cream)] text-[var(--color-charcoal)]"
                >
                  {county}
                </span>
              ))}
            </div>
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
