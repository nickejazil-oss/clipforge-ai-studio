// Google Apps Script for ClipForge AI Studio Order Management
// Deploy as Web App: Execute as: Me | Who has access: Anyone

const SHEET_ID = '179meHnFW5SLSdHXQjy9cNRdyXx-BE1Vgo3XMRCfvpns';
const SHEET_NAME = 'Orders';
const EMAIL_SHEET = 'Emails';

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getOrders') {
    return getOrders();
  }
  
  return HtmlService.createHtmlOutput('ClipForge API Ready');
}

function doPost(e) {
  const action = e.parameter.action || JSON.parse(e.postData.contents).action;
  
  if (action === 'submitOrder') {
    const data = JSON.parse(e.postData.contents);
    return submitOrder(data);
  }
  
  if (action === 'updatePayment') {
    const data = JSON.parse(e.postData.contents);
    return updatePayment(data);
  }
  
  if (action === 'getOrders') {
    return getOrders();
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
}

function submitOrder(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Order ID',
        'Timestamp',
        'Name',
        'Email',
        'Package',
        'Platforms',
        'Footage Link',
        'Notes',
        'Status',
        'Payment Status',
        'Amount',
        'Payment Method',
        'Notes (Internal)'
      ]);
    }
    
    // Generate Order ID
    const orderId = generateOrderId();
    const timestamp = new Date().toLocaleString();
    
    // Add order to sheet
    sheet.appendRow([
      orderId,
      timestamp,
      data.name,
      data.email,
      data.package,
      data.platforms,
      data.link,
      data.notes,
      'Received',
      'Pending',
      getPriceForPackage(data.package),
      '',
      ''
    ]);
    
    // Send confirmation email
    sendConfirmationEmail(data.email, data.name, orderId, data.package);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orderId: orderId,
      message: 'Order submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function generateOrderId() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return 'ORD-001';
    }
    
    const data = sheet.getDataRange().getValues();
    const lastRow = data.length;
    const lastOrderId = data[lastRow - 1][0];
    
    if (!lastOrderId || lastOrderId === 'Order ID') {
      return 'ORD-001';
    }
    
    const num = parseInt(lastOrderId.split('-')[1]) + 1;
    return 'ORD-' + String(num).padStart(3, '0');
  } catch (e) {
    return 'ORD-001';
  }
}

function getPriceForPackage(pkg) {
  const prices = {
    '5 Short Videos — $30': 30,
    '10 Short Videos — $75': 75,
    '20 Short Videos — $150': 150,
    'Captions Only — $10': 10,
    'Thumbnails — $10 each': 10,
    'Social Media Package — $50': 50
  };
  return prices[pkg] || 0;
}

function sendConfirmationEmail(email, name, orderId, package_name) {
  try {
    const subject = `Order Confirmation: ${orderId} - ClipForge AI Studio`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF4E1F; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✓ Order Received</h1>
        </div>
        <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hi ${name},</p>
          <p>Thanks for your order! We've received your request and will get started on your clips right away.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF4E1F;">
            <h3 style="margin-top: 0; color: #121316;">Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Package:</strong> ${package_name}</p>
            <p><strong>Status:</strong> Processing</p>
            <p><strong>Expected Turnaround:</strong> 2-4 business days</p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>We'll review your footage and confirm the scope</li>
            <li>Send you an invoice for payment</li>
            <li>Begin editing and deliver your clips</li>
          </ol>
          
          <p>Questions? Reply to this email or contact us at <strong>hello@clipforgeai.studio</strong></p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated confirmation. Please keep this email for your records.
          </p>
        </div>
      </div>
    `;
    
    GmailApp.sendEmail(email, subject, '', {
      htmlBody: htmlBody,
      from: 'noreply@clipforgeai.studio'
    });
  } catch (e) {
    Logger.log('Email error: ' + e.toString());
  }
}

function updatePayment(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.orderId) {
        sheet.getRange(i + 1, 10).setValue(data.paymentStatus); // Payment Status
        sheet.getRange(i + 1, 12).setValue(data.paymentMethod); // Payment Method
        sheet.getRange(i + 1, 13).setValue(data.internalNotes); // Internal Notes
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Payment updated'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Order not found'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
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
    const orders = [];
    
    for (let i = 1; i < data.length; i++) {
      orders.push({
        orderId: data[i][0],
        timestamp: data[i][1],
        name: data[i][2],
        email: data[i][3],
        package: data[i][4],
        platforms: data[i][5],
        status: data[i][8],
        paymentStatus: data[i][9],
        amount: data[i][10]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orders: orders.reverse()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      orders: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Scheduled function to monitor orders (set up trigger manually in Apps Script UI)
function monitorOrders() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const status = data[i][8];
      const paymentStatus = data[i][9];
      
      // Auto-update status based on payment
      if (paymentStatus === 'Paid' && status === 'Received') {
        sheet.getRange(i + 1, 9).setValue('In Progress');
      }
    }
  } catch (e) {
    Logger.log('Monitor error: ' + e.toString());
  }
}
