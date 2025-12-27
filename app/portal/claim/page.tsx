'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, Building2, MapPin, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { searchProviders, PROVIDER_TYPES, US_STATES } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchResult {
  id: number;
  name: string;
  provider_type: string;
  city: string;
  state: string;
  phone?: string;
  is_claimed: boolean;
}

export default function ClaimListingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'results' | 'confirm'>('search');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<SearchResult | null>(null);

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [providerType, setProviderType] = useState('');

  const handleSearch = async () => {
    if (!city || !state) return;

    setSearching(true);
    try {
      const data = await searchProviders({
        city,
        state,
        provider_type: providerType || '',
      });
      setResults(data.providers || []);
      setStep('results');
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (provider: SearchResult) => {
    if (provider.is_claimed) return;
    setSelectedProvider(provider);
    setStep('confirm');
  };

  const handleClaim = () => {
    if (!selectedProvider) return;
    router.push(`/portal/login?claim=${selectedProvider.id}`);
  };

  const getProviderTypeLabel = (type: string) => {
    return PROVIDER_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-cream-dark)]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="font-display text-2xl font-semibold text-[var(--color-teal)]">
            Parent<span className="text-[var(--color-coral)]">Glue</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Search', 'Select', 'Claim'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i === 0 && step === 'search'
                    ? 'bg-[var(--color-teal)] text-white'
                    : i === 1 && step === 'results'
                    ? 'bg-[var(--color-teal)] text-white'
                    : i === 2 && step === 'confirm'
                    ? 'bg-[var(--color-teal)] text-white'
                    : 'bg-[var(--color-cream-dark)] text-[var(--color-charcoal-light)]'
                }`}
              >
                {i + 1}
              </div>
              <span className="text-sm text-[var(--color-charcoal-light)] hidden sm:inline">
                {label}
              </span>
              {i < 2 && (
                <div className="w-8 h-px bg-[var(--color-cream-dark)] hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Search */}
        {step === 'search' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Claim Your Listing</CardTitle>
              <CardDescription>
                Search for your practice to claim and manage your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Provider Type (optional)</Label>
                <Select value={providerType} onValueChange={setProviderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {PROVIDER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSearch}
                disabled={!city || !state || searching}
                className="w-full"
              >
                {searching ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Search className="mr-2" size={16} />
                )}
                Search for My Practice
              </Button>

              <p className="text-center text-sm text-[var(--color-charcoal-light)]">
                Don't see your listing?{' '}
                <Link href="/portal/login" className="text-[var(--color-teal)] hover:underline">
                  Create a new account
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Results */}
        {step === 'results' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-[var(--color-charcoal)]">
                {results.length} Provider{results.length !== 1 ? 's' : ''} Found
              </h2>
              <Button variant="ghost" onClick={() => setStep('search')}>
                ← New Search
              </Button>
            </div>

            {results.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 size={48} className="mx-auto mb-4 text-[var(--color-cream-dark)]" />
                  <p className="text-[var(--color-charcoal-light)] mb-4">
                    No providers found matching your search
                  </p>
                  <Button onClick={() => setStep('search')}>
                    Try Different Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {results.map((provider) => (
                  <Card
                    key={provider.id}
                    className={`cursor-pointer transition-all ${
                      provider.is_claimed
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-[var(--color-teal)] hover:shadow-md'
                    }`}
                    onClick={() => handleSelect(provider)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                            <Building2 size={20} className="text-[var(--color-teal)]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--color-charcoal)]">
                              {provider.name}
                            </h3>
                            <p className="text-sm text-[var(--color-teal)]">
                              {getProviderTypeLabel(provider.provider_type)}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-[var(--color-charcoal-light)]">
                              <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {provider.city}, {provider.state}
                              </span>
                              {provider.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {provider.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {provider.is_claimed ? (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Already Claimed
                          </span>
                        ) : (
                          <ArrowRight size={20} className="text-[var(--color-teal)]" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <p className="text-center text-sm text-[var(--color-charcoal-light)]">
              Don't see your practice?{' '}
              <Link href="/portal/login" className="text-[var(--color-teal)] hover:underline">
                Create a new listing
              </Link>
            </p>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && selectedProvider && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-[var(--color-teal)]" />
              </div>
              <CardTitle className="text-2xl">Confirm Your Listing</CardTitle>
              <CardDescription>
                You're about to claim this practice profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-[var(--color-cream)]">
                <h3 className="font-semibold text-[var(--color-charcoal)]">
                  {selectedProvider.name}
                </h3>
                <p className="text-sm text-[var(--color-teal)]">
                  {getProviderTypeLabel(selectedProvider.provider_type)}
                </p>
                <p className="text-sm text-[var(--color-charcoal-light)] mt-1">
                  {selectedProvider.city}, {selectedProvider.state}
                </p>
              </div>

              <div className="space-y-2 text-sm text-[var(--color-charcoal-light)]">
                <p>By claiming this listing, you confirm that:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You are authorized to manage this practice's profile</li>
                  <li>You agree to our Terms of Service</li>
                  <li>You will keep the information accurate and up-to-date</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('results')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleClaim} className="flex-1">
                  Claim & Create Account
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Already have account */}
        <p className="text-center text-sm text-[var(--color-charcoal-light)] mt-8">
          Already have an account?{' '}
          <Link href="/portal/login" className="text-[var(--color-teal)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
