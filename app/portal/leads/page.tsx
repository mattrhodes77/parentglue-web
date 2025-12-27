'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail, Phone, MessageSquare, Lock, ArrowUpRight, Filter } from 'lucide-react';
import { api, Lead, LeadsResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-[var(--color-teal)]/10 text-[var(--color-teal-dark)]',
  contacted: 'bg-[var(--color-coral)]/10 text-[#8B5A3C]',
  converted: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
};

const LEAD_TYPE_LABELS: Record<string, string> = {
  phone_reveal: 'Phone',
  contact_click: 'Contact',
  website_click: 'Website',
  booking_click: 'Booking',
  inquiry: 'Inquiry',
};

export default function LeadsPage() {
  const { subscriptionTier } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const canSeeDetails = subscriptionTier === 'basic' || subscriptionTier === 'premium';

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  const loadLeads = async () => {
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const data = await api<LeadsResponse>(`/api/portal/leads${query}`);
      setLeads(data.leads);
      setTotal(data.total);
    } catch (e) {
      console.error('Failed to load leads:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: number, status: string) => {
    try {
      await api(`/api/portal/leads/${leadId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      loadLeads();
    } catch (e) {
      console.error('Failed to update lead status:', e);
    }
  };

  const handleUpgrade = async () => {
    try {
      const data = await api<{ checkout_url?: string }>('/api/portal/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'basic',
          success_url: `${window.location.origin}/portal/leads?upgraded=true`,
          cancel_url: `${window.location.origin}/portal/leads`,
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

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-charcoal)]">
            Leads
          </h1>
          <p className="text-sm text-[var(--color-charcoal-light)] mt-1">
            {total} total lead{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-[var(--color-charcoal-light)]" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!canSeeDetails && leads.length > 0 && (
        <Card className="bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-teal-dark)] text-white border-0">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock size={24} />
                <div>
                  <p className="font-semibold">Lead details are locked</p>
                  <p className="text-sm text-white/80">
                    Upgrade to see contact info and messages
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpgrade}
                variant="secondary"
                className="bg-white text-[var(--color-teal-dark)] hover:bg-[var(--color-cream)]"
              >
                Upgrade Now
                <ArrowUpRight size={16} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-[var(--color-cream-dark)]" />
            <p className="text-[var(--color-charcoal-light)]">
              No leads yet. They'll appear here when parents contact you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className={STATUS_COLORS[lead.status]}>
                        {lead.status}
                      </Badge>
                      <span className="text-xs text-[var(--color-charcoal-light)]">
                        {LEAD_TYPE_LABELS[lead.lead_type] || lead.lead_type}
                      </span>
                      <span className="text-xs text-[var(--color-charcoal-light)]">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {canSeeDetails ? (
                      <div className="space-y-1">
                        {lead.parent_email && (
                          <a
                            href={`mailto:${lead.parent_email}`}
                            className="flex items-center gap-2 text-sm text-[var(--color-teal)] hover:underline"
                          >
                            <Mail size={14} />
                            {lead.parent_email}
                          </a>
                        )}
                        {lead.parent_phone && (
                          <a
                            href={`tel:${lead.parent_phone}`}
                            className="flex items-center gap-2 text-sm text-[var(--color-teal)] hover:underline"
                          >
                            <Phone size={14} />
                            {lead.parent_phone}
                          </a>
                        )}
                        {lead.message && (
                          <p className="text-sm text-[var(--color-charcoal-light)] mt-2">
                            "{lead.message}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="blur-sm select-none">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={14} />
                            parent@example.com
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <Phone size={14} />
                            (555) 123-4567
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock size={20} className="text-[var(--color-charcoal-light)]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {canSeeDetails && lead.status === 'new' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'contacted')}
                      >
                        Mark Contacted
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateLeadStatus(lead.id, 'converted')}
                      >
                        Converted
                      </Button>
                    </div>
                  )}

                  {canSeeDetails && lead.status === 'contacted' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateLeadStatus(lead.id, 'converted')}
                      >
                        Mark Converted
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateLeadStatus(lead.id, 'archived')}
                      >
                        Archive
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
