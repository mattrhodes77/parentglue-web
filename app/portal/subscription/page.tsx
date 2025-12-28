'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, Star, Zap, Crown, Mail, CreditCard } from 'lucide-react';
import { api, Subscription, createBillingPortalSession } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TIERS = [
  {
    id: 'claimed',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Basic listing visibility',
    icon: Zap,
    features: [
      'Appear in search results',
      'Basic profile page',
      'See lead count (not details)',
      'Up to 5 leads/month tracking',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$49',
    period: '/month',
    description: 'For growing practices',
    icon: Star,
    popular: true,
    features: [
      'Everything in Free',
      'See lead contact details',
      'Up to 25 leads/month',
      'Lead status tracking',
      'Email notifications',
      'Verified badge',
    ],
    cta: 'Upgrade to Basic',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$99',
    period: '/month',
    description: 'For established practices',
    icon: Crown,
    features: [
      'Everything in Basic',
      'Unlimited leads',
      'Featured placement in search',
      'Priority support',
      'Analytics dashboard',
      'Monthly performance report',
    ],
    cta: 'Upgrade to Premium',
  },
];

export default function SubscriptionPage() {
  const { subscriptionTier } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [openingBilling, setOpeningBilling] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const handleManageBilling = async () => {
    setOpeningBilling(true);
    try {
      const { url } = await createBillingPortalSession(window.location.href);
      window.location.href = url;
    } catch (e) {
      console.error('Failed to open billing portal:', e);
      setOpeningBilling(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const data = await api<Subscription>('/api/portal/subscription');
      setSubscription(data);
    } catch (e) {
      console.error('Failed to load subscription:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    setUpgrading(tier);
    try {
      const data = await api<{ checkout_url?: string }>('/api/portal/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({
          tier,
          success_url: `${window.location.origin}/portal/subscription?upgraded=true`,
          cancel_url: `${window.location.origin}/portal/subscription`,
        }),
      });
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (e) {
      console.error('Upgrade failed:', e);
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-teal)]" size={40} />
      </div>
    );
  }

  const currentTierIndex = TIERS.findIndex(t => t.id === subscriptionTier);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-charcoal)]">
          Subscription
        </h1>
        <p className="text-sm text-[var(--color-charcoal-light)] mt-1">
          Choose the plan that's right for your practice
        </p>
      </div>

      {/* Current Plan Status */}
      {subscription && (
        <Card className="bg-[var(--color-cream)]">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-charcoal-light)]">Current Plan</p>
                <p className="font-semibold text-[var(--color-charcoal)] capitalize">
                  {subscription.tier}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {subscription.current_period_end && (
                  <div className="text-right">
                    <p className="text-sm text-[var(--color-charcoal-light)]">Renews</p>
                    <p className="font-medium text-[var(--color-charcoal)]">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {subscription.stripe_customer_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageBilling}
                    disabled={openingBilling}
                    className="gap-2"
                  >
                    {openingBilling ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <CreditCard size={14} />
                    )}
                    Manage Billing
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {TIERS.map((tier, index) => {
          const isCurrentPlan = tier.id === subscriptionTier;
          const isDowngrade = index < currentTierIndex;
          const Icon = tier.icon;

          return (
            <Card
              key={tier.id}
              className={`relative ${
                tier.popular
                  ? 'border-2 border-[var(--color-teal)] shadow-lg'
                  : ''
              } ${isCurrentPlan ? 'bg-[var(--color-cream)]' : ''}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-teal)]">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center">
                  <Icon size={24} className="text-[var(--color-teal)]" />
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[var(--color-charcoal)]">
                    {tier.price}
                  </span>
                  <span className="text-[var(--color-charcoal-light)]">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-[var(--color-teal)] mt-0.5 flex-shrink-0" />
                      <span className="text-[var(--color-charcoal)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button disabled className="w-full" variant="outline">
                    Current Plan
                  </Button>
                ) : isDowngrade ? (
                  <Button disabled className="w-full" variant="ghost">
                    Contact to Downgrade
                  </Button>
                ) : tier.disabled ? (
                  <Button disabled className="w-full" variant="outline">
                    {tier.cta}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={!!upgrading}
                    className="w-full"
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {upgrading === tier.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      tier.cta
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Card */}
      <Card className="bg-[var(--color-cream)]">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-coral)]/10 flex items-center justify-center">
                <Mail size={24} className="text-[var(--color-coral)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-charcoal)]">
                  Need a custom plan?
                </p>
                <p className="text-sm text-[var(--color-charcoal-light)]">
                  Contact us for enterprise pricing or multi-location discounts
                </p>
              </div>
            </div>
            <a
              href="mailto:providers@parentglue.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-coral)] text-white font-semibold rounded-xl hover:bg-[#D69668] transition-colors"
            >
              <Mail size={16} />
              Contact Sales
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
