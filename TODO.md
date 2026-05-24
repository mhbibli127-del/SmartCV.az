# TODO - Stripe configuration + code hardening

- [ ] Create .env.local.example with required Stripe env vars
- [x] Update lib/stripe.ts so missing STRIPE_SECRET_KEY does NOT throw during module init / rendering
      - Only Stripe API routes should fail with 503

- [ ] Ensure endpoints already check isStripeConfigured() (verify none elsewhere crashes)
- [ ] Run TypeScript check / tests

