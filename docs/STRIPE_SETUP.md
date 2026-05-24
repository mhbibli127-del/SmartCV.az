# SmartCV Stripe Subscription Setup

## File structure

```
lib/
  stripe-config.ts          # Lookup keys & plan mapping
  stripe.ts                 # Stripe client, resolve price by lookup key
  subscription-service.ts   # Sync subscription → database

app/api/
  checkout/route.ts         # POST — create Checkout Session (subscription)
  webhook/stripe/route.ts   # POST — Stripe webhooks (required)
  subscription/route.ts     # GET — current user subscription

components/
  UpgradeToProButton.tsx    # "Upgrade to Pro" → Stripe Checkout

prisma/schema.prisma        # User subscription fields
```

## Environment variables

Add to `.env.local`:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="file:./dev.db"

# Auth (existing)
JWT_SECRET=your-jwt-secret

# Stripe (required for live checkout)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: publishable key for future Stripe Elements
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Stripe Dashboard setup

### 1. Create products & prices with lookup keys

| Lookup key | Price | Billing |
|------------|-------|---------|
| `smartcv_starter_monthly` | $5.99 | Monthly recurring |
| `smartcv_pro_monthly` | $9.99 | Monthly recurring |
| `smartcv_pro_yearly` | $79.00 | Yearly recurring |

In Stripe Dashboard → **Products** → create price → set **Lookup key** (not Price ID).

### 2. Webhook endpoint

**Developers → Webhooks → Add endpoint**

- URL: `https://your-domain.com/api/webhook/stripe`
- Local dev: use [Stripe CLI](https://stripe.com/docs/stripe-cli)

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

### 3. Events to enable

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed` (recommended)

## API usage

### Create checkout session

```http
POST /api/checkout
Content-Type: application/json
Cookie: token=...

{
  "lookupKey": "smartcv_pro_monthly"
}
```

Response:

```json
{ "sessionId": "cs_...", "url": "https://checkout.stripe.com/..." }
```

### Get subscription (frontend)

```http
GET /api/subscription
```

Response:

```json
{
  "plan": "pro",
  "subscriptionPlan": "pro",
  "subscriptionStatus": "active",
  "lookupKey": "smartcv_pro_monthly",
  "hasActiveSubscription": true
}
```

## Database fields (User)

| Field | Description |
|-------|-------------|
| `subscriptionPlan` | `free` \| `starter` \| `pro` |
| `subscriptionStatus` | Stripe status: `active`, `canceled`, etc. |
| `stripeCustomerId` | Stripe Customer ID |
| `stripeSubscriptionId` | Stripe Subscription ID |
| `stripePriceLookupKey` | Active price lookup key |
| `subscriptionCurrentPeriodEnd` | Renewal date |

## Frontend button

```tsx
import UpgradeToProButton from "@/components/UpgradeToProButton";

<UpgradeToProButton />
<UpgradeToProButton lookupKey="smartcv_starter_monthly" label="Starter — $5.99" />
```

## Apply database migration

```bash
npx prisma db push
# or
npx prisma migrate deploy
```
