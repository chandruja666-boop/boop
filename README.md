<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8ce5cdcd-0265-4265-8ba1-37ed4c251832

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Synchronized Mock Backend

Products, inventory stock, and orders are persisted in the shared Express mock backend instead of relying only on browser storage. Run both processes in separate terminals:

1. Start the backend: `npm run backend`
2. Start the storefront: `npm run dev`

The backend listens on port `4000`, while Vite proxies `/api` requests from the storefront. Product changes and order status updates are written centrally, new orders update the central orders collection, and open storefront/admin sessions poll for changes every five seconds. The backend creates `server-data.json` on first run and keeps it out of source control.

For local verification, set `OTP_MODE=test`, `PAYMENT_MODE=test`, and configure `ADMIN_PASSWORD` in the backend environment. Test OTP codes are returned only by the backend in test mode. Production payment mode requires Razorpay API keys and webhook secret; the checkout fails closed when they are missing or when a signature is invalid.
