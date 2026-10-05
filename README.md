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

## Shared Backend and Admin Updates

Products, categories, coupons, storefront content, and orders are stored by the Express backend and broadcast to connected storefronts. Product and banner uploads are compressed in the browser and stored with those shared records, so all devices see the same images. For local development, `npm run dev` starts both the backend on port `4000` and Vite on port `3000`; use `npm run backend` and `npm run dev:frontend` in separate terminals only when you need to run or inspect them independently. Do not deploy the Vite development server publicly: it is not the production server and its `/api` proxy requires the backend process to be running.

The backend listens on the hosting provider's assigned `PORT` in production, while Vite proxies `/api` requests from the development storefront. Product reads are served from Firebase Realtime Database through the backend Admin SDK, and authenticated product creates, edits, and deletes use Firebase transactions so concurrent Render instances do not overwrite unrelated product changes. Firebase change events notify connected storefronts; periodic refresh is retained as a fallback. The backend creates `server-data.json` on first run for its local cache. In production, the built storefront uses `https://cp-furniture.in/api` by default. If the frontend and backend are deployed separately, set `VITE_API_BASE_URL=https://<your-backend-host>/api` when building the frontend; every frontend must use the same API base URL.

For Render, deploy this repository as a **Web Service** using the included `render.yaml` blueprint. The build creates the frontend in `dist/` and bundles the Express backend into `server.js`; the start command must be `node server.js`, and the backend serves both the API and built storefront. Do not set the Render service start command to `npm run dev`, `vite`, or `vite preview`: the development server proxies `/api` to `localhost:4000` and is not a production backend. If Render logs show `[vite] http proxy error` or `ECONNREFUSED` for `/api`, update the service's Start Command in Render Settings to `node server.js` and redeploy the latest commit. Attach `cp-furniture.in` to that web service after deployment, or set `VITE_API_BASE_URL` to the actual Render backend URL when hosting the frontend separately. Set the `FIREBASE_DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` Render environment variables. The blueprint requires Firebase at startup so product data and uploaded product images are not silently kept on an ephemeral Render filesystem. Set `PAYMENT_MODE=production` and the live Razorpay key ID/secret and webhook secret to enable real payments; keep these values in backend-only Render environment variables.

The JSON database fallback is only durable when its directory is durable. Firebase Realtime Database is supported for shared durable storage and cross-instance update events. For Render, create a Firebase Realtime Database and service account, set `FIREBASE_DATABASE_URL` and the full service-account JSON in the backend-only `FIREBASE_SERVICE_ACCOUNT_JSON` variable, then set `FIREBASE_REQUIRED=true`. Never put the service-account JSON in frontend variables or commit it. With Firebase enabled, the backend loads existing Firebase state at startup, or seeds the Firebase path from `server-data.json` on the first connection; successful edits are written to Firebase before the API reports success. The server listens to Firebase changes and notifies connected storefronts. Set the Realtime Database rules to deny direct client reads and writes; Admin SDK access is server-side. The example rules are in `firebase.database.rules.json`.

For local development without Firebase credentials, the server falls back to `server-data.json` and `/api/health` reports `persistence: "local-json"`; these local edits are not shared. Use a dedicated Firebase development project if you want to test the complete shared flow. On Render, remove `DATA_DIR` if Firebase is the only persistence target, or retain it as a local cache. Keep `FIREBASE_REQUIRED=true` in production so a missing Firebase configuration prevents the backend silently starting in local-only mode.

For local verification, set `OTP_MODE=test`, `PAYMENT_MODE=test`, and configure a strong `ADMIN_PASSWORD` in the backend environment. Test OTP codes are returned only by the backend in test mode. Admin writes require a currently valid admin session. Test payments use Razorpay's native checkout with a `rzp_test_...` key pair; production mode requires live Razorpay keys.

## Razorpay Standard Checkout

Set `PAYMENT_MODE=production` and configure the **live** `RAZORPAY_KEY_ID` (`rzp_live_...`) and `RAZORPAY_KEY_SECRET` on the deployed backend only. The server calculates the order amount from its product prices, stock, and coupon data; it rejects a client total that does not match. In the Razorpay dashboard, register `https://<your-backend-host>/api/webhooks/razorpay` as a webhook URL and enable the `payment.captured` event. Set `RAZORPAY_WEBHOOK_SECRET` on the backend to the same secret configured in the dashboard. Never expose the key secret or webhook secret in frontend variables.

The backend creates INR orders with Razorpay, verifies the checkout signature and captured payment against Razorpay's API, and updates matching persisted orders when a signed `payment.captured` webhook arrives. Checkout is displayed by Razorpay's official JavaScript SDK; the app does not collect UPI IDs, card details, or bank transfer information. For sandbox testing, set `PAYMENT_MODE=test` with a Razorpay test key ID (`rzp_test_...`) and test key secret. Use live keys and `PAYMENT_MODE=production` only when ready to accept real charges.

## Fast2SMS OTP

On the deployed backend, set `OTP_MODE=production`, `OTP_PROVIDER=fast2sms`, and `FAST2SMS_API_KEY` to the active Fast2SMS API key. This endpoint accepts Indian mobile numbers only (10 digits, optionally prefixed with `+91`), and applies a 30-second resend wait. Delivery also depends on the Fast2SMS account having OTP route access/credits and being allowed to send to the target number. Keep this API key on the backend; never add it to a `VITE_` variable.
