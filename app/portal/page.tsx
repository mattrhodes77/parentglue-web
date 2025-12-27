'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, MousePointerClick, Users, TrendingUp, Loader2, ArrowUpRight, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function PortalDashboard() {
  const { subscriptionTier } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [leads, setLeads] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, leadsData] = await Promise.all([
        api('/api/portal/analytics'),
        api('/api/portal/leads?limit=5'),
      ]);

      setAnalytics(analyticsData);
      setLeads(leadsData);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const data = await api<{ checkout_url?: string }>('/api/portal/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({
          tier,
          success_url: `${window.location.origin}/portal?upgraded=true`,
          cancel_url: `${window.location.origin}/portal`,
        }),
      });
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (e) {
      console.error('Upgrade failed:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-teal)]" size={40} />
      </div>
    );
  }

  const canSeeDetails = subscriptionTier === 'basic' || subscriptionTier === 'premium';

  return (
    <div>
      {/* Upgrade Banner */}
        {subscriptionTier === 'claimed' && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-teal-dark)] text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-semibold mb-1">Upgrade to see lead details</h3>
                <p className="text-white/80 text-sm">
                  Get notified when parents inquire, see their contact info, and track your conversions.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpgrade('basic')}
                  className="px-5 py-2.5 bg-white text-[var(--color-teal-dark)] font-semibold rounded-xl hover:bg-[var(--color-cream)] transition-colors"
                >
                  Basic $49/mo
                </button>
                <button
                  onClick={() => handleUpgrade('premium')}
                  className="px-5 py-2.5 bg-[var(--color-coral)] text-white font-semibold rounded-xl hover:bg-[#D69668] transition-colors"
                >
                  Premium $99/mo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Profile Views',
              value: analytics?.summary?.profile_views || 0,
              icon: Eye,
              color: 'var(--color-teal)',
            },
            {
              label: 'Contact Clicks',
              value: analytics?.summary?.contact_clicks || 0,
              icon: MousePointerClick,
              color: 'var(--color-coral)',
            },
            {
              label: 'Total Leads',
              value: analytics?.summary?.total_leads || 0,
              icon: Users,
              color: 'var(--color-sage)',
            },
            {
              label: 'New Leads',
              value: analytics?.summary?.new_leads || 0,
              icon: TrendingUp,
              color: 'var(--color-teal)',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--color-charcoal-light)]">{stat.label}</span>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <p className="font-display text-3xl font-semibold text-[var(--color-charcoal)]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-[var(--color-charcoal)]">
              Recent Leads
            </h2>
            {leads?.total > 0 && (
              <span className="text-sm text-[var(--color-charcoal-light)]">
                {leads.total} total
              </span>
            )}
          </div>

          {leads?.leads?.length === 0 ? (
            <div className="text-center py-12">
              <Users size={40} className="mx-auto mb-4 text-[var(--color-cream-dark)]" />
              <p className="text-[var(--color-charcoal-light)]">
                No leads yet. They&apos;ll appear here when parents contact you.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[var(--color-charcoal-light)] border-b border-[var(--color-cream-dark)]">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Message</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads?.leads?.map((lead: any) => (
                    <tr key={lead.id} className="border-b border-[var(--color-cream-dark)] last:border-0">
                      <td className="py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-lg bg-[var(--color-cream)] text-[var(--color-charcoal)]">
                          {lead.lead_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4">
                        {canSeeDetails ? (
                          <div className="text-sm">
                            <div className="font-medium text-[var(--color-charcoal)]">
                              {lead.parent_email || '—'}
                            </div>
                            <div className="text-[var(--color-charcoal-light)]">
                              {lead.parent_phone || ''}
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="blur-lock text-sm">
                              <div>parent@example.com</div>
                              <div>(555) 123-4567</div>
                            </div>
                            <div className="absolute inset-0 flex items-center">
                              <Lock size={14} className="text-[var(--color-charcoal-light)]" />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 max-w-xs">
                        {canSeeDetails ? (
                          <p className="text-sm text-[var(--color-charcoal-light)] truncate">
                            {lead.message || '—'}
                          </p>
                        ) : (
                          <div className="relative">
                            <p className="blur-lock text-sm">Looking for ABA services...</p>
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-[var(--color-charcoal-light)]">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                          lead.status === 'new'
                            ? 'bg-[var(--color-teal)]/10 text-[var(--color-teal-dark)]'
                            : lead.status === 'contacted'
                            ? 'bg-[var(--color-coral)]/10 text-[#8B5A3C]'
                            : lead.status === 'converted'
                            ? 'bg-[var(--color-success)]/20 text-[#4A7A5A]'
                            : 'bg-[var(--color-cream)] text-[var(--color-charcoal-light)]'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!canSeeDetails && leads?.leads?.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-[var(--color-cream)] text-center">
              <p className="text-sm text-[var(--color-charcoal-light)] mb-3">
                Upgrade to see lead contact details and messages
              </p>
              <button
                onClick={() => handleUpgrade('basic')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-teal)] text-white font-semibold rounded-xl hover:bg-[var(--color-teal-dark)] transition-colors text-sm"
              >
                Upgrade to Basic
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
  );
}
