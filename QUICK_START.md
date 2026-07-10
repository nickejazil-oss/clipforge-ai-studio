# ⚡ Quick Start (5 Minutes)

## **Do This Now**

### 1️⃣ Google Apps Script (2 min)
```
→ Go to: https://script.google.com
→ New Project
→ Paste code from google-apps-script.js
→ Save
→ Deploy → New Deployment → Web app
→ Copy the Deployment URL
```

### 2️⃣ Update Your Website (1 min)
Replace in **index.html** (line ~1048):
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercall';
```

Replace in **payment-tracker.html** (line ~174):
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercall';
```

### 3️⃣ Test (1 min)
- Open your website
- Go to **Order Now** section
- Fill form → Submit
- Check email ✓
- Check Google Sheet ✓

### 4️⃣ View Dashboard (1 min)
- Open `payment-tracker.html`
- See live order stats
- Syncs every 30 seconds

---

## **That's It!** 🚀

Your system is live:
- ✅ Order form → Google Sheet (auto)
- ✅ Unique Order IDs (auto)
- ✅ Confirmation emails (auto)
- ✅ Live dashboard (syncs every 30s)
- ✅ Payment tracking (manual or webhook)

---

## **Sheet Structure (Auto-Created)**

Your Google Sheet automatically gets an "Orders" sheet with:
- Order ID (ORD-001, ORD-002, etc.)
- Date, Name, Email, Package
- Platforms, Footage Link, Notes
- Status, Payment Info
- Confirmation Sent flag

---

## **What Customers See**

1. They fill the order form
2. They get instant confirmation with Order ID
3. They receive confirmation email within seconds
4. You receive admin notification

---

## **What You See**

### On Dashboard (`payment-tracker.html`):
- Total Orders
- Total Revenue
- Paid Orders
- Pending Orders
- Full order history with filters
- Real-time updates every 30 seconds

### On Google Sheet:
- Complete order data
- Payment tracking
- Manual status updates

---

## **Next Steps**

### Optional Enhancements:
- [ ] Connect Stripe for automated payments
- [ ] Set up PayPal webhooks
- [ ] Add custom email templates
- [ ] Create admin approval workflow
- [ ] Integrate with project management tool

### Documentation:
- Full guide: `DEPLOYMENT_GUIDE.md`
- Script reference: `google-apps-script.js`
- Dashboard features: `payment-tracker.html`

---

## **Troubleshooting**

**Form doesn't submit?**
- Check browser console (F12)
- Verify deployment ID is correct
- Make sure Web App is deployed as "Anyone"

**No emails?**
- Check Apps Script Executions tab for errors
- Google may need permissions (run once manually)

**Dashboard empty?**
- Refresh page
- Check same deployment ID in both files
- Check Google Sheet has "Orders" sheet

---

**Questions?** Check DEPLOYMENT_GUIDE.md for detailed setup.

**All set!** Your ClipForge order system is live. 🎬
