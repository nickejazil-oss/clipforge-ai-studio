// Google Apps Script for ClipForge Order Management
// Deploy as web app: Deploy > New deployment > Web app > Execute as: Me > Allow access

// DO THIS FIRST:
// 1. Go to script.google.com
// 2. Create new project
// 3. Paste this entire code
// 4. Save as "ClipForge Order Handler"
// 5. Deploy > New deployment > Type: Web app
// 6. Execute as: Your email
// 7. Allow access when prompted
// 8. Copy the Web App URL and use it below

const SHEET_ID = "YOUR_SHEET_ID_HERE"; // Get from: https://docs.google.com/spreadsheets/d/COPY_THIS_ID/edit
const SHEET_NAME = "Orders";

function doPost(e) {
  try {
    const params = e.parameter;
    
    // Validate required fields
    if (!params.name || !params.email || !params.package) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing required fields"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Get or create sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      addHeaders(sheet);
    }

    // Generate Order ID
    const orderId = "ORD-" + String(sheet.getLastRow()).padStart(3, '0');
    const timestamp = new Date().toLocaleString();

    // Prepare row data
    const rowData = [
      orderId,
      params.name || "",
      params.email || "",
      params.package || "",
      extractPrice(params.package) || 0,
      "pending",
      "pending",
      params.paymentMethod || "email",
      "",
      params.platforms || "",
      params.link || "",
      params.notes || "",
      params.fileInfo || "",
      timestamp,
      "" // Transaction ID
    ];

    // Append to sheet
    sheet.appendRow(rowData);

    // Send confirmation email
    sendConfirmationEmail(params.email, orderId, params);

    // Log to console
    Logger.log(`Order ${orderId} received from ${params.email}`);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orderId: orderId,
      message: "Order received successfully!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(`Error: ${error.toString()}`);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === "getOrders") {
    return getOrders();
  } else if (action === "updatePayment") {
    return updatePayment(e.parameter);
  } else if (action === "getStats") {
    return getStats();
  }

  return ContentService.createTextOutput("ClipForge Order System v1.0").setMimeType(ContentService.MimeType.TEXT);
}

function getOrders() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        orders: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const orders = [];

    for (let i = 1; i < data.length; i++) {
      orders.push(arrayToObject(headers, data[i]));
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orders: orders
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function updatePayment(params) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const orderId = params.orderId;
    const status = params.status;
    const method = params.method;
    const txnId = params.txnId || "";

    if (!sheet || !orderId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Invalid parameters"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        // Update columns
        sheet.getRange(i + 1, 7).setValue(status); // Payment Status
        sheet.getRange(i + 1, 8).setValue(method); // Payment Method
        sheet.getRange(i + 1, 15).setValue(txnId); // Transaction ID
        sheet.getRange(i + 1, 16).setValue(new Date().toLocaleString()); // Updated

        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: `Order ${orderId} payment updated to ${status}`
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Order not found"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getStats() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet || sheet.getLastRow() < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        totalOrders: 0,
        totalRevenue: 0,
        pendingAmount: 0,
        completedOrders: 0
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    let totalRevenue = 0, pendingAmount = 0, completedOrders = 0;

    for (let i = 1; i < data.length; i++) {
      const row = arrayToObject(headers, data[i]);
      const amount = parseFloat(row.Amount) || 0;
      
      if (row["Payment Status"] === "paid") {
        totalRevenue += amount;
      } else if (row["Payment Status"] === "pending") {
        pendingAmount += amount;
      }
      
      if (row.Status === "shipped") {
        completedOrders++;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      totalOrders: data.length - 1,
      totalRevenue: totalRevenue,
      pendingAmount: pendingAmount,
      completedOrders: completedOrders
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(`Error in getStats: ${error}`);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function addHeaders(sheet) {
  const headers = [
    "Order ID",
    "Name",
    "Email",
    "Package",
    "Amount",
    "Status",
    "Payment Status",
    "Payment Method",
    "Notes",
    "Platforms",
    "Footage Link",
    "Special Notes",
    "Files Uploaded",
    "Date Created",
    "Transaction ID"
  ];
  sheet.appendRow(headers);
}

function extractPrice(packageStr) {
  const match = packageStr.match(/\$(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function arrayToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index] || "";
  });
  return obj;
}

function sendConfirmationEmail(email, orderId, params) {
  try {
    const subject = `Order Confirmed: ${orderId}`;
    const message = `
Hi ${params.name},

Your order has been received!

Order ID: ${orderId}
Package: ${params.package}
Email: ${email}
Platforms: ${params.platforms || "Not specified"}

We'll start working on your clips right away. You can track your order status at:
https://nickejazil-oss.github.io/clipforge-ai-studio/payment-tracker.html

If you have any questions, reply to this email or contact us at hello@clipforgeai.studio

Best regards,
ClipForge AI Studio Team
    `;

    GmailApp.sendEmail(email, subject, message, {
      from: Session.getEffectiveUser().getEmail()
    });

    Logger.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    Logger.log(`Could not send email: ${error.toString()}`);
  }
}

// Test function (run this to verify setup)
function test() {
  const testOrder = {
    parameter: {
      name: "Test User",
      email: "test@example.com",
      package: "5 Short Videos — $30",
      paymentMethod: "paypal",
      platforms: "TikTok",
      link: "https://youtube.com/watch?v=test",
      notes: "Test order",
      fileInfo: "test.mp4 (100MB)"
    }
  };
  
  const result = doPost(testOrder);
  Logger.log(result.getContent());
}
