# ParentGlue Endpoint Connection Status

Last updated: 2025-12-27

> Tracks all backend API endpoints and their frontend integration status.

**Backend:** `https://api.parentglue.com` (EC2:8004)
**Frontend:** `https://parentglue.com` (Vercel)

## Quick Overview

| Router | Endpoints | Connected | Partial | Missing |
|--------|-----------|-----------|---------|---------|
| `/api/offices` | 7 | 7 | 0 | 0 |
| `/api/providers` | 6 | 4 | 0 | 2 |
| `/api/portal` | 11 | 11 | 0 | 0 |
| `/api/leads` | 4 | 3 | 0 | 1 |
| **Total** | **28** | **25** | **0** | **3** |

### Status Legend

| Status | Meaning |
|--------|---------|
| ✅ | Fully connected - backend endpoint + frontend function + UI component |
| ⚠️ | Partial - endpoint exists but route mismatch or missing UI |
| ❌ | Not connected - backend exists, no frontend integration |
| 🚧 | Backend not implemented yet |

---

## Offices API (`/api/offices`)

**Backend:** `api/routers/offices.py`
**Frontend API:** `lib/api.ts`

| # | Endpoint | Method | Frontend Function | UI Component | Status |
|---|----------|--------|-------------------|--------------|--------|
| 1 | `/api/offices/states` | GET | `getStateAgencies()` | `/offices` | ✅ |
| 2 | `/api/offices/states/{state}` | GET | `getStateAgency()` | `/offices/[state]` | ✅ |
| 3 | `/api/offices/offices` | GET | `getRegionalOffices()` | `/offices/[state]` | ✅ |
| 4 | `/api/offices/offices/{office_id}` | GET | `getOfficeDetail()` | `/offices/[state]/[id]` | ✅ |
| 5 | `/api/offices/lookup/county` | GET | `lookupOfficeByCounty()` | Onboarding flow | ✅ |
| 6 | `/api/offices/office-types` | GET | `getOfficeTypes()` | (available) | ✅ |
| 7 | `/api/offices/stats` | GET | `getOfficeStats()` | `/offices` | ✅ |

### Offices Notes

- Full office directory now available at `/offices`
- State-level view with regional offices at `/offices/[state]`
- Office detail with services, eligibility, timeline at `/offices/[state]/[id]`

---

## Providers API (`/api/providers`)

**Backend:** `api/routers/providers.py`
**Frontend API:** `lib/api.ts`

| # | Endpoint | Method | Frontend Function | UI Component | Status |
|---|----------|--------|-------------------|--------------|--------|
| 1 | `/api/providers/types` | GET | `getProviderTypes()` | Search filters | ✅ |
| 2 | `/api/providers/search` | GET | `searchProviders()` | `/search` page | ✅ |
| 3 | `/api/providers/cached` | GET | ❌ None | ❌ None | ❌ |
| 4 | `/api/providers/location/{city}/{state}` | GET | ❌ None | ❌ None | ❌ |
| 5 | `/api/providers/stats` | GET | ❌ None | ❌ None | ❌ |
| 6 | `/api/providers/provider/{provider_id}` | GET | `getProvider()` | `/provider/[id]` | ✅ |

### Providers Notes

- ~~ROUTE MISMATCH: Fixed 2025-12-27~~
- Provider types are hardcoded in frontend, should fetch from `/types`
- Cache status endpoints not exposed to users (admin only)

---

## Portal API (`/api/portal`)

**Backend:** `api/routers/portal.py`
**Frontend API:** `lib/api.ts`

| # | Endpoint | Method | Frontend Function | UI Component | Status |
|---|----------|--------|-------------------|--------------|--------|
| 1 | `/api/portal/register` | POST | `portalRegister()` | `/portal/register` | ✅ |
| 2 | `/api/portal/login` | POST | `portalLogin()` | `/portal/login` | ✅ |
| 3 | `/api/portal/profile` | GET | `getPortalProfile()` | `/portal/dashboard`, `/portal/profile` | ✅ |
| 4 | `/api/portal/profile` | PUT | `api()` inline | `/portal/profile` | ✅ |
| 5 | `/api/portal/leads` | GET | `getPortalLeads()` | `/portal/leads` | ✅ |
| 6 | `/api/portal/leads/{lead_id}` | PUT | `api()` inline | `/portal/leads` | ✅ |
| 7 | `/api/portal/analytics` | GET | `getPortalAnalytics()` | `/portal/dashboard` | ✅ |
| 8 | `/api/portal/subscription` | GET | `getSubscription()` | `/portal/billing` | ✅ |
| 9 | `/api/portal/subscription/checkout` | POST | `createCheckoutSession()` | `/portal/billing` | ✅ |
| 10 | `/api/portal/subscription/billing-portal` | POST | `createBillingPortalSession()` | `/portal/subscription` | ✅ |
| 11 | `/api/portal/webhook/stripe` | POST | N/A (Stripe calls) | N/A | ✅ |

### Portal Notes

- All portal endpoints fully connected
- Webhook is server-to-server (Stripe → backend)

---

## Leads API (`/api/leads`)

**Backend:** `api/routers/leads.py`
**Frontend API:** `lib/api.ts`

| # | Endpoint | Method | Frontend Function | UI Component | Status |
|---|----------|--------|-------------------|--------------|--------|
| 1 | `/api/leads/track/{provider_id}` | POST | `trackLead()` | `ContactButton` | ✅ |
| 2 | `/api/leads/inquiry/{provider_id}` | POST | `submitInquiry()` | `InquiryForm` | ✅ |
| 3 | `/api/leads/stats` | GET | ❌ None | ❌ None | ❌ |
| 4 | `/api/leads/provider/{provider_id}/stats` | GET | `getProviderLeadStats()` | `ClaimBanner` | ✅ |

### Leads Notes

- Basic tracking works (contact clicks, phone reveals, etc.)
- Inquiry form (contact request with message) not built
- Global lead stats not exposed (admin use only)

---

## Frontend Files Reference

### API Client
- **File:** `lib/api.ts`
- **Auth Helper:** `lib/auth.ts` (Zustand store)

### Pages Using APIs

| Page | APIs Used |
|------|-----------|
| `/search` | `searchProviders()`, `trackLead()` |
| `/provider/[id]` | `getProvider()`, `getProviderLeadStats()`, `trackLead()`, `submitInquiry()` |
| `/offices` | `getStateAgencies()`, `getOfficeStats()` |
| `/offices/[state]` | `getStateAgency()`, `getRegionalOffices()` |
| `/offices/[state]/[id]` | `getOfficeDetail()` |
| `/resources` | `getResources()`, `getResourceCategories()` |
| `/timeline` | `generateTimeline()`, `getDemoTimeline()` |
| `/letters` | `getLetterTemplates()`, `generateLetter()` |
| `/portal/login` | `portalLogin()` |
| `/portal/register` | `portalRegister()` |
| `/portal/dashboard` | `getPortalProfile()`, `getPortalAnalytics()`, `getPortalLeads()` |
| `/portal/billing` | `getSubscription()`, `createCheckoutSession()` |

### Components Using APIs

| Component | Location | APIs Used |
|-----------|----------|-----------|
| `ContactButton` | `components/providers/` | `trackLead()` |
| `ClaimBanner` | `components/providers/` | (receives stats as prop) |
| `AddToCalendarButton` | `components/providers/` | None (local only) |
| `InquiryForm` | `components/providers/` | `submitInquiry()` |

---

## Priority Fixes

### P0 - Blocking Issues

✅ All resolved

### P1 - Missing Core Features

| Feature | Backend Ready | Frontend Work |
|---------|---------------|---------------|
| ~~Profile edit~~ | ✅ `PUT /api/portal/profile` | ✅ Fixed route 2025-12-27 |
| ~~Lead status update~~ | ✅ `PUT /api/portal/leads/{id}` | ✅ Fixed route 2025-12-27 |
| ~~Inquiry form~~ | ✅ `POST /api/leads/inquiry/{id}` | ✅ Added InquiryForm 2025-12-27 |
| ~~Billing portal~~ | ✅ `POST /api/portal/subscription/billing-portal` | ✅ Added Manage Billing button 2025-12-27 |

### P2 - Nice to Have

| Feature | Backend Ready | Frontend Work |
|---------|---------------|---------------|
| ~~State/office directory~~ | ✅ Full offices API | ✅ Built `/offices` pages 2025-12-27 |
| ~~Provider types from API~~ | ✅ `GET /api/providers/types` | ✅ Added `getProviderTypes()` 2025-12-27 |
| Provider cache info | ✅ `GET /api/providers/cached` | Admin dashboard |

---

## Verification Commands

```bash
# Test backend endpoints
curl https://api.parentglue.com/api/health
curl https://api.parentglue.com/api/offices/stats
curl https://api.parentglue.com/api/providers/types
curl "https://api.parentglue.com/api/providers/search?city=Sacramento&state=CA&provider_type=aba_therapy"

# Test provider detail (current backend route)
curl https://api.parentglue.com/api/providers/provider/1
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-27 | Added `getProviderTypes()` API function |
| 2025-12-27 | Built office directory (`/offices`, `/offices/[state]`, `/offices/[state]/[id]`) |
| 2025-12-27 | Added billing portal button + `createBillingPortalSession()` API |
| 2025-12-27 | Added InquiryForm component + `submitInquiry()` API |
| 2025-12-27 | Fixed lead status update route (`/api/portal/leads/{id}` PUT) |
| 2025-12-27 | Fixed profile edit route (`/api/portal/profile` PUT) |
| 2025-12-27 | Fixed provider detail route (`/api/providers/provider/{id}`) |
| 2025-12-27 | Initial audit of all endpoints |
