# 🚀 ClipForge AI Studio - Deployment Guide

Complete setup for automated order processing with Google Sheets + Google Apps Script.

---

## **Step 1: Set Up Google Apps Script**

### 1.1 Go to Google Apps Script
- Visit: https://script.google.com
- Click **"+ New Project"**
- Name it: `ClipForge Order Backend`

### 1.2 Copy the Script Code
- Delete any existing code
- Copy the entire contents of `google-apps-script.js` from this repo
- Paste it into the script editor
- Click **Save** (Ctrl+S)

---

## **Step 2: Deploy as Web App**

### 2.1 Create a New Deployment
- Click **Deploy** (top right)
- Select **"New deployment"**
- Click the gear icon → select **Web app**

### 2.2 Configure Deployment
Fill in these settings:
- **Execute as:** (Your Google account)
- **Who has access:** **Anyone**

### 2.3 Deploy
- Click **Deploy**
- A dialog appears with your deployment URL
- **COPY THIS URL** — it looks like:
  ```
  https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercall
  ```

---

## **Step 3: Update Your Website**

### 3.1 Update `index.html`
Find this line (around line 1048):
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercall';
```

Replace `YOUR_DEPLOYMENT_ID` with your actual ID from Step 2.3

### 3.2 Update `payment-tracker.html`
Find the same line (around line 174) and update it with the same deployment ID.

---

## **Step 4: Verify Google Sheet Setup**

Your script automatically creates an "Orders" sheet in your Google Sheet with these columns:

| Column | Purpose |
|--------|---------|
| Order ID | ORD-001, ORD-002, etc. |
| Date | Order submission timestamp |
| Name | Customer name |
| Email | Customer email |
| Package | Selected service |
| Price | USD amount |
| Platforms | TikTok, Reels, Shorts |
| Footage Link | Google Drive/YouTube link |
| Notes | Customer notes |
| Status | Pending / Payment Received / Completed |
| Payment Method | PayPal, Stripe, etc. |
| Payment Date | When payment was received |
| Amount Paid | Actual paid amount |
| Confirmation Sent | Yes/No |

---

## **Step 5: Test Everything**

### 5.1 Test the Order Form
1. Go to your website
2. Scroll to **"Order Now"** section
3. Fill out the form:
   - Name: `Test User`
   - Email: `your@email.com`
   - Package: `5 Short Videos — $30`
   - Platforms: Check any boxes
   - Click **Send Order**

### 5.2 Check for Results
- ✅ Should see success message with Order ID
- ✅ Check your email for confirmation
- ✅ Check your Google Sheet for the new row

### 5.3 Test the Dashboard
- Open `payment-tracker.html`
- Should see the order appear
- Stats should update automatically

---

## **Step 6: Go Live**

### 6.1 Deploy Your Website
- Push your repo to GitHub Pages, Netlify, Vercel, etc.
- Or deploy to your own hosting

### 6.2 Update Email Settings (Optional)
In `google-apps-script.js`, find:
```javascript
const EMAIL_FROM = 'hello@clipforgeai.studio';
```

Change to your actual business email if you want a different sender.

---

## **Step 7: Automate Payment Updates**

### 7.1 Manual Updates
You can update payment status by editing the Google Sheet directly:
- Edit the **Status** column to `Payment Received`
- Edit **Payment Method** to `PayPal`, `Stripe`, etc.
- Edit **Amount Paid** to the payment amount
- Dashboard refreshes automatically every 30 seconds

### 7.2 Optional: Webhook Integration
If you use a payment processor like Stripe or PayPal, you can set up webhooks to automatically update the sheet. Contact support for webhook setup.

---

## **Common Issues & Fixes**

### Issue: Form submission fails silently
**Fix:** Check browser console (F12) for errors. Ensure deployment ID is correct.

### Issue: Emails not being sent
**Fix:** Google Apps Script needs permission. Run the script once manually to grant permissions.

### Issue: Dashboard shows no orders
**Fix:** Refresh page. Check that deployment ID is the same in both index.html and payment-tracker.html.

### Issue: "Deployment ID not found"
**Fix:** Make sure you copied the ID correctly from the deployment dialog. It should start with `s/` in the URL.

---

## **Security Notes**

- ✅ Web app is deployed as "Anyone" so forms can submit
- ✅ Google Apps Script handles all validation server-side
- ✅ Google Sheets permissions are private to your account
- ✅ No sensitive data stored in frontend code

---

## **Support**

For issues or questions:
1. Check the GitHub Issues
2. Review Google Apps Script logs: **Executions** tab in Apps Script
3. Check browser console for network errors (F12)

---

## **Next: Payment Integration**

Once orders are flowing, connect your payment processor:
- [Stripe Setup Guide](https://stripe.com/docs)
- [PayPal Setup Guide](https://developer.paypal.com)
- [Wise (formerly TransferWise) API](https://wise.com/api)

Each has webhook capabilities to auto-update the sheet.

**You're all set! 🎉 Start taking orders!**
