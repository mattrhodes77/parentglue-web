'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { submitInquiry } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface InquiryFormProps {
  providerId: number;
  providerName: string;
}

export function InquiryForm({ providerId, providerName }: InquiryFormProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [childAge, setChildAge] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) {
      setError('Please provide an email or phone number');
      return;
    }

    setSending(true);
    setError('');

    try {
      await submitInquiry(providerId, {
        email: email || undefined,
        phone: phone || undefined,
        child_age: childAge || undefined,
        message: message || undefined,
        source_page: 'provider_profile',
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-8 text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
        <h3 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-2">
          Request Sent!
        </h3>
        <p className="text-[var(--color-charcoal-light)]">
          {providerName} will receive your contact request and reach out soon.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-6">
      <h3 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-4">
        Contact {providerName}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="childAge">Child's Age (optional)</Label>
          <Input
            id="childAge"
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            placeholder="e.g., 4 years old"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message (optional)</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell them a bit about what you're looking for..."
            rows={3}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" disabled={sending} className="w-full gap-2">
          {sending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Send size={16} />
          )}
          {sending ? 'Sending...' : 'Send Contact Request'}
        </Button>

        <p className="text-xs text-[var(--color-charcoal-light)] text-center">
          Your info will be shared with {providerName} so they can contact you.
        </p>
      </form>
    </div>
  );
}
