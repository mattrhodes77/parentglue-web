const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';

// ============================================================================
// Provider Portal Types
// ============================================================================

export type SubscriptionTier = 'unclaimed' | 'claimed' | 'basic' | 'premium';
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';
export type LeadType = 'contact_click' | 'phone_reveal' | 'website_click' | 'booking_click' | 'inquiry';

// ============================================================================
// API Helpers
// ============================================================================

// Raw fetch that returns Response object (for login/register flows)
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pg_token') : null;

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

// Typed API function that parses JSON and handles auth errors
export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pg_token') : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('pg_token');
    window.location.href = '/portal/login';
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Provider types - fallback list (API preferred)
export const PROVIDER_TYPES_FALLBACK = [
  { value: 'aba_therapy', label: 'ABA Therapy' },
  { value: 'speech_therapy', label: 'Speech Therapy' },
  { value: 'occupational_therapy', label: 'Occupational Therapy' },
  { value: 'developmental_pediatrician', label: 'Developmental Pediatrician' },
  { value: 'neuropsychologist', label: 'Neuropsychologist' },
  { value: 'iep_advocate', label: 'IEP Advocate' },
  { value: 'special_ed_attorney', label: 'Special Ed Attorney' },
  { value: 'respite_care', label: 'Respite Care' },
  { value: 'social_skills_group', label: 'Social Skills Group' },
  { value: 'early_intervention', label: 'Early Intervention' },
];

// Kept for backward compatibility - prefer getProviderTypes()
export const PROVIDER_TYPES = PROVIDER_TYPES_FALLBACK;

export interface ProviderType {
  value: string;
  label: string;
}

export async function getProviderTypes(): Promise<ProviderType[]> {
  try {
    const res = await fetch(`${API_URL}/api/providers/types`);
    if (!res.ok) return PROVIDER_TYPES_FALLBACK;
    return res.json();
  } catch {
    return PROVIDER_TYPES_FALLBACK;
  }
}

// US States
export const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
];

// Lead tracking
export async function trackLead(
  providerId: number,
  leadType: LeadType,
  sourcePage: 'search_results' | 'provider_profile'
) {
  try {
    await fetch(`${API_URL}/api/leads/track/${providerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_type: leadType, source_page: sourcePage }),
    });
  } catch (e) {
    console.error('Lead tracking failed:', e);
  }
}

// Search providers
export async function searchProviders(params: {
  city: string;
  state: string;
  provider_type: string;
}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/providers/search?${query}`);
  return res.json();
}

// Get provider details
export async function getProvider(id: number) {
  const res = await fetch(`${API_URL}/api/providers/provider/${id}`);
  return res.json();
}

// Get provider lead stats (for claim banner)
export async function getProviderLeadStats(id: number) {
  const res = await fetch(`${API_URL}/api/leads/provider/${id}/stats`);
  return res.json();
}

// Submit inquiry to provider
export async function submitInquiry(providerId: number, data: {
  email?: string;
  phone?: string;
  child_age?: string;
  message?: string;
  source_page?: string;
}) {
  const res = await fetch(`${API_URL}/api/leads/inquiry/${providerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to send inquiry' }));
    throw new Error(error.detail);
  }
  return res.json();
}

// ============================================================================
// Provider Portal Interfaces
// ============================================================================

export interface PortalProfile {
  id: number;
  email: string;
  business_name: string;
  contact_name?: string;
  subscription_tier: SubscriptionTier;
  provider_id?: number;
  created_at: string;
}

export interface Lead {
  id: number;
  lead_type: LeadType;
  status: LeadStatus;
  parent_email?: string;
  parent_phone?: string;
  message?: string;
  source_page: string;
  created_at: string;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
}

export interface AnalyticsSummary {
  profile_views: number;
  contact_clicks: number;
  total_leads: number;
  new_leads: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  leads_by_day?: Record<string, number>;
}

export interface Subscription {
  tier: SubscriptionTier;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
}

// ============================================================================
// Core Types
// ============================================================================

export type DiagnosisStatus = 'not_started' | 'in_progress' | 'diagnosed';

export interface County {
  name: string;
  state_code: string;
  regional_office_id?: string;
}

export interface RegionalOffice {
  id: string;
  name: string;
  state: string;
  office_type: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  counties_served: string[];
}

export interface ChildProfile {
  name: string;
  date_of_birth: string;
  state: string;
  county: string;
  regional_office_id?: string;
  diagnosis_status: DiagnosisStatus;
  diagnosis_date?: string;
}

export interface Timeline {
  overdue: TimelineEvent[];
  due_soon: TimelineEvent[];
  upcoming: TimelineEvent[];
  completed: TimelineEvent[];
  next_action?: TimelineEvent;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  due_date?: string;
  action_items: string[];
  resources: string[];
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  summary?: string;
  url?: string;
  phone?: string;
  quick_facts?: string[];
  tips?: string[];
  key_contacts?: Record<string, string>;
  timeline?: { age?: string; description: string; action?: string }[];
}

export type LetterType = 'iep_request' | 'rc_intake' | 'insurance_appeal' | 'aba_auth' | 'school_records' | 'complaint';

export interface FieldHint {
  field: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export interface LetterTemplate {
  type: LetterType;
  name: string;
  title: string;
  description: string;
  category: string;
  fields: FieldHint[];
  legal_basis?: string;
  urgency_note?: string;
}

export interface GeneratedLetter {
  type: LetterType;
  content: string;
  subject?: string;
  instructions?: string;
  generated_at: string;
}

// ============================================================================
// Office & Location APIs
// ============================================================================

export interface StateAgency {
  id: number;
  state: string;
  state_name: string;
  agency_name: string;
  phone: string | null;
  website: string | null;
}

export interface OfficeStats {
  state_agencies: number;
  regional_offices: number;
  enriched_offices: number;
  county_mappings: number;
  states_covered: number;
}

export interface OfficeType {
  office_type: string;
  count: number;
}

export async function getStateAgencies(): Promise<StateAgency[]> {
  const res = await fetch(`${API_URL}/api/offices/states`);
  return res.json();
}

export async function getStateAgency(stateCode: string): Promise<StateAgency> {
  const res = await fetch(`${API_URL}/api/offices/states/${stateCode}`);
  return res.json();
}

export async function getRegionalOffices(params?: {
  state?: string;
  office_type?: string;
  limit?: number;
  offset?: number;
}): Promise<RegionalOffice[]> {
  const query = params ? new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
  ).toString() : '';
  const res = await fetch(`${API_URL}/api/offices/offices${query ? `?${query}` : ''}`);
  return res.json();
}

export async function getOfficeDetail(officeId: number): Promise<{ office: RegionalOffice; counties_served: string[] }> {
  const res = await fetch(`${API_URL}/api/offices/offices/${officeId}`);
  return res.json();
}

export async function getOfficeTypes(): Promise<OfficeType[]> {
  const res = await fetch(`${API_URL}/api/offices/office-types`);
  return res.json();
}

export async function getOfficeStats(): Promise<OfficeStats> {
  const res = await fetch(`${API_URL}/api/offices/stats`);
  return res.json();
}

export async function getCountiesForState(stateCode: string): Promise<{ counties: County[] }> {
  const res = await fetch(`${API_URL}/api/offices/states/${stateCode}/counties`);
  return res.json();
}

export async function lookupOfficeByCounty(state: string, county: string): Promise<RegionalOffice | null> {
  try {
    const res = await fetch(`${API_URL}/api/offices/lookup/county?state=${state}&county=${encodeURIComponent(county)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ============================================================================
// Portal API Functions
// ============================================================================

export async function portalLogin(email: string, password: string) {
  const res = await apiFetch('/api/portal/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data as { token: string; provider_id: string; business_name: string; subscription_tier: string };
}

export async function portalRegister(data: {
  email: string;
  password: string;
  business_name: string;
  contact_name?: string;
  discovered_provider_id?: number;
}) {
  const res = await apiFetch('/api/portal/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.detail || 'Registration failed');
  return result as { token: string; provider_id: string; business_name: string; subscription_tier: string };
}

export async function getPortalProfile(): Promise<PortalProfile> {
  return api<PortalProfile>('/api/portal/profile');
}

export async function getPortalLeads(limit?: number): Promise<LeadsResponse> {
  const query = limit ? `?limit=${limit}` : '';
  return api<LeadsResponse>(`/api/portal/leads${query}`);
}

export async function getPortalAnalytics(): Promise<AnalyticsResponse> {
  return api<AnalyticsResponse>('/api/portal/analytics');
}

export async function getSubscription(): Promise<Subscription> {
  return api<Subscription>('/api/portal/subscription');
}

export async function createCheckoutSession(data: {
  tier: 'basic' | 'premium';
  success_url: string;
  cancel_url: string;
}): Promise<{ checkout_url: string }> {
  return api<{ checkout_url: string }>('/api/portal/subscription/checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createBillingPortalSession(returnUrl: string): Promise<{ url: string }> {
  return api<{ url: string }>('/api/portal/subscription/billing-portal', {
    method: 'POST',
    body: JSON.stringify({ return_url: returnUrl }),
  });
}

// ============================================================================
// Legacy API object for old pages
// ============================================================================

const legacyApi = {
  generateTimeline: async (profile: ChildProfile): Promise<Timeline> => {
    const res = await fetch(`${API_URL}/api/timeline/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },
  getDemoTimeline: async (): Promise<Timeline> => {
    const res = await fetch(`${API_URL}/api/timeline/demo`);
    return res.json();
  },
  getResources: async (category?: string): Promise<{ resources: Resource[] }> => {
    const query = category ? `?category=${category}` : '';
    const res = await fetch(`${API_URL}/api/resources${query}`);
    const data = await res.json();
    return { resources: Array.isArray(data) ? data : data.resources || [] };
  },
  getResourceCategories: async (): Promise<{ categories: { id: string; name: string }[] }> => {
    const res = await fetch(`${API_URL}/api/resources/categories/list`);
    const data = await res.json();
    return { categories: Array.isArray(data) ? data : data.categories || [] };
  },
  getCategories: async (): Promise<{ id: string; name: string }[]> => {
    const res = await fetch(`${API_URL}/api/resources/categories/list`);
    return res.json();
  },
  getLetterTemplates: async (): Promise<{ templates: LetterTemplate[]; by_category: Record<string, LetterTemplate[]> }> => {
    const res = await fetch(`${API_URL}/api/documents/templates`);
    return res.json();
  },
  getLetterTemplate: async (type: LetterType): Promise<LetterTemplate & { field_hints?: Record<string, FieldHint> }> => {
    const res = await fetch(`${API_URL}/api/documents/templates/${type}`);
    return res.json();
  },
  generateLetter: async (data: {
    letter_type: LetterType;
    profile: ChildProfile;
    parent_name?: string;
    parent_address?: string;
    [key: string]: unknown;
  }): Promise<GeneratedLetter> => {
    const res = await fetch(`${API_URL}/api/documents/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export default legacyApi;
