'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { api, PROVIDER_TYPES, US_STATES } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProviderProfile {
  id: number;
  business_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  provider_types: string[];
  insurance_accepted: string[];
  accepts_new_clients: boolean;
}

const INSURANCE_OPTIONS = [
  'Medi-Cal',
  'Kaiser',
  'Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'United Healthcare',
  'Private Pay',
  'Regional Center Funded',
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api<ProviderProfile>('/api/portal/provider-profile');
      setProfile(data);
    } catch (e) {
      console.error('Failed to load profile:', e);
      // Initialize with empty profile for new providers
      setProfile({
        id: 0,
        business_name: '',
        email: '',
        provider_types: [],
        insurance_accepted: [],
        accepts_new_clients: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError('');
    setSaved(false);

    try {
      await api('/api/portal/provider-profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleProviderType = (type: string) => {
    if (!profile) return;
    const types = profile.provider_types.includes(type)
      ? profile.provider_types.filter(t => t !== type)
      : [...profile.provider_types, type];
    setProfile({ ...profile, provider_types: types });
  };

  const toggleInsurance = (insurance: string) => {
    if (!profile) return;
    const list = profile.insurance_accepted.includes(insurance)
      ? profile.insurance_accepted.filter(i => i !== insurance)
      : [...profile.insurance_accepted, insurance];
    setProfile({ ...profile, insurance_accepted: list });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-teal)]" size={40} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-charcoal)]">
            Provider Profile
          </h1>
          <p className="text-sm text-[var(--color-charcoal-light)] mt-1">
            Manage how your practice appears to families
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : saved ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Basic information about your practice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={profile.business_name}
                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                placeholder="Your practice name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={profile.contact_name || ''}
                onChange={(e) => setProfile({ ...profile, contact_name: e.target.value })}
                placeholder="Primary contact"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={profile.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://yourpractice.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="Tell families about your practice, specialties, and approach..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where families can find you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="123 Main Street, Suite 100"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={profile.state || ''}
                onValueChange={(value) => setProfile({ ...profile, state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input
                id="zip"
                value={profile.zip || ''}
                onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
                placeholder="12345"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Types */}
      <Card>
        <CardHeader>
          <CardTitle>Service Types</CardTitle>
          <CardDescription>Select all services your practice offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PROVIDER_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleProviderType(type.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  profile.provider_types.includes(type.value)
                    ? 'bg-[var(--color-teal)] text-white'
                    : 'bg-[var(--color-cream-dark)] text-[var(--color-charcoal)] hover:bg-[var(--color-teal)]/10'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insurance */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Accepted</CardTitle>
          <CardDescription>Select all insurance plans you accept</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INSURANCE_OPTIONS.map((insurance) => (
              <button
                key={insurance}
                onClick={() => toggleInsurance(insurance)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  profile.insurance_accepted.includes(insurance)
                    ? 'bg-[var(--color-teal)] text-white'
                    : 'bg-[var(--color-cream-dark)] text-[var(--color-charcoal)] hover:bg-[var(--color-teal)]/10'
                }`}
              >
                {insurance}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Let families know if you're taking new clients</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setProfile({ ...profile, accepts_new_clients: !profile.accepts_new_clients })}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
              profile.accepts_new_clients
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
            }`}
          >
            {profile.accepts_new_clients ? '✓ Accepting New Clients' : 'Not Accepting New Clients'}
          </button>
        </CardContent>
      </Card>

      {/* Mobile save button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-[var(--color-cream-dark)] md:hidden">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : saved ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
