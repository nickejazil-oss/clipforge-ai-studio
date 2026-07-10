# 🔧 Google Sheets Integration Setup Guide

## Overview
This guide connects your ClipForge website to Google Sheets for automatic order tracking and payment management.

---

## 📋 Step 1: Create a Google Sheet

1. Go to **https://sheets.google.com**
2. Click **"+ Create new spreadsheet"**
3. Name it: **"ClipForge Orders"**
4. You now have a blank sheet ready!

---

## 🔐 Step 2: Deploy the Google Apps Script

### 2a. Create the Script

1. Go to **https://script.google.com**
2. Click **"+ New project"**
3. Copy the entire code from `google-apps-script.js` in this repo
4. Paste it into the script editor
5. Save the project as: **"ClipForge Order Handler"**

### 2b. Replace YOUR_SHEET_ID

1. Go to your Google Sheet: **https://sheets.google.com**
2. Copy the URL, it looks like:
   ```
   https://docs.google.com/spreadsheets/d/1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX9YZ/edit
   ```
3. Copy this part: `1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX9YZ` (between `/d/` and `/edit`)
4. Go back to the script
5. Find this line: `const SHEET_ID = "YOUR_SHEET_ID_HERE";`
6. Replace with: `const SHEET_ID = "1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX9YZ";`
7. **Save** the script (Ctrl+S)

### 2c. Deploy as Web App

1. Click **"Deploy"** button (top right)
2. Click **"New deployment"**
3. Click the gear icon → select **"Web app"**
4. Fill in:
   - **Execute as:** Your email address
   - **Who has access:** Anyone
5. Click **"Deploy"**
6. You'll see a warning — click **"Review permissions"**
7. Select your account
8. Click **"Allow"** (gives the script permission to access your sheet)
9. Copy the **Web App URL** — it looks like:
   ```
   https://script.google.com/macros/d/AKfycb.../usercript
   ```
10. **Save this URL** — you'll need it in Step 3

---

## 🌐 Step 3: Update Your Website

Replace the form submission in `index.html` with the Google Sheets endpoint:

### 3a. Find and Update in index.html

Find this line in the JavaScript (around line 600):
```javascript
window.location.href = `mailto:hello@clipforgeai.studio?subject=...`;
```

Replace the entire `orderForm` submit handler with:

```javascript
document.getElementById('orderForm').addEventListener('submit', async function(e){
  e.preventDefault();
  
  const WEB_APP_URL = "PASTE_YOUR_WEB_APP_URL_HERE"; // Replace this!
  
  const formData = new FormData();
  formData.append('name', document.getElementById('oname').value);
  formData.append('email', document.getElementById('oemail').value);
  formData.append('package', document.getElementById('pkg').value);
  formData.append('link', document.getElementById('olink').value);
  formData.append('platforms', Array.from(document.querySelectorAll('.chip input:checked')).map(c => c.value).join(', '));
  formData.append('notes', document.getElementById('onotes').value);
  formData.append('fileInfo', selectedFiles.length > 0 ? selectedFiles.map(f => `${f.name} (${(f.size/(1024*1024)).toFixed(1)}MB)`).join(', ') : 'No files');

  try {
    const response = await fetch(WEB_APP_URL, {method: 'POST', body: formData});
    const result = await response.json();
    
    if(result.success){
      alert(`✓ Order ${result.orderId} received!\n\nWe'll start working on your clips right away.`);
      document.getElementById('orderForm').reset();
      selectedFiles = [];
      document.getElementById('fileList').innerHTML = '';
      
      if(typeof gtag !== 'undefined'){
        gtag('event', 'order_submitted', {order_id: result.orderId});
      }
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    alert(`Submission failed: ${error.message}`);
  }
});
```

---

## 📊 Step 4: Update Payment Tracker

Update `payment-tracker.html` to sync with Google Sheets:

Find the initialization section and add:

```javascript
// Load orders from Google Sheets
async function syncFromGoogleSheets(){
  try {
    const WEB_APP_URL = "PASTE_YOUR_WEB_APP_URL_HERE?action=getOrders"; // Same URL as above
    const response = await fetch(WEB_APP_URL);
    const data = await response.json();
    
    if(data.success && data.orders){
      orders = data.orders.map(o => ({
        id: o['Order ID'],
        customer: o['Name'],
        email: o['Email'],
        package: o['Package'],
        amount: parseFloat(o['Amount']) || 0,
        status: o['Status'] || 'pending',
        payment: o['Payment Status'] || 'pending',
        method: o['Payment Method'] || 'paypal',
        date: o['Date Created'],
        platforms: o['Platforms'],
        notes: o['Special Notes']
      }));
      
      localStorage.setItem('clipforge_orders', JSON.stringify(orders));
      renderOrders();
      updateStats();
    }
  } catch(error){
    console.log('Could not sync from Google Sheets:', error);
  }
}

// Call on page load
syncFromGoogleSheets();

// Auto-sync every 30 seconds
setInterval(syncFromGoogleSheets, 30000);
```

---

## ✅ Step 5: Test Everything

### Test the Script

1. Go back to https://script.google.com
2. Find the `test()` function in the code
3. Click the **Play button** (▶) to run it
4. Check Google Sheet → should have 1 test order

### Test the Form

1. Visit your website: https://nickejazil-oss.github.io/clipforge-ai-studio
2. Scroll to "Order Now"
3. Fill out the form with test data
4. Click "Send Order"
5. You should get a success message
6. Check your Google Sheet → new order should appear!
7. Check Payment Tracker → order should sync within 30 seconds

---

## 🔄 How It Works

```
Form Submission → Google Apps Script → Google Sheet → Payment Tracker (auto-sync every 30s)
```

| Step | What Happens |
|------|---|
| 1️⃣ User fills form | Name, email, package, video link |
| 2️⃣ Click "Send Order" | Data sent to Google Apps Script |
| 3️⃣ Script processes | Generates Order ID, validates data |
| 4️⃣ Saves to Sheet | New row added to Google Sheet |
| 5️⃣ Email sent | Confirmation email to customer |
| 6️⃣ Payment Tracker syncs | Automatically fetches latest orders |

---

## 📧 Emails

When an order is submitted, a confirmation email is sent to the customer with:
- Order ID
- Package details
- Payment tracker link
- Your contact info

---

## 🚨 Troubleshooting

### Problem: "Script error" when submitting form
**Solution:** Check that `WEB_APP_URL` is correctly pasted (no extra spaces)

### Problem: Orders not appearing in Google Sheet
**Solution:** 
1. Check `SHEET_ID` is correct
2. Make sure script was deployed as "Web app"
3. Run the `test()` function to verify script works

### Problem: Payment Tracker not syncing
**Solution:**
1. Check browser console for errors (F12)
2. Verify `WEB_APP_URL` is accessible
3. Manually refresh the payment tracker page

### Problem: "Permission denied"
**Solution:** Re-deploy the script with correct permissions:
1. Go to script.google.com
2. Delete old deployment (garbage icon)
3. Deploy again → select "Anyone" for access

---

## 🔐 Security Notes

- Script runs as your Google account
- Only you can edit the script
- Data stored in your own Google Sheet
- No third-party access

---

## 📞 Support

If you need help:
1. Check the troubleshooting section above
2. Look at browser console (F12) for error messages
3. Contact: hello@clipforgeai.studio

---

## 🎉 You're All Set!

Your ClipForge order system is now fully connected:
- ✅ Website form → Google Sheet
- ✅ Automatic Order IDs
- ✅ Payment tracking
- ✅ Real-time syncing
- ✅ Customer confirmations

Start taking orders! 🚀
