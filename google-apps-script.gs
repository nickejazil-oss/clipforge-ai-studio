/*
  GOOGLE SHEETS SYNC SCRIPT FOR CLIPFORGE AI STUDIO
  
  Instructions:
  1. Go to https://script.google.com
  2. Create a new project
  3. Paste this entire script into the editor
  4. Save the project
  5. Click "Deploy" > "New deployment" > "Web app"
  6. Set "Execute as" to your email
  7. Set "Who has access" to "Anyone"
  8. Copy the deployment URL
  9. Replace SCRIPT_URL in payment-tracker.html and index.html with your URL
  10. Create a Google Sheet with columns: Order ID, Customer, Email, Package, Amount, Status, Payment, Method, Transaction ID, Notes, Platforms, Date, Video Files
*/

// ==================================================
// GOOGLE SHEETS SETUP
// ==================================================

// Create the sheet if it doesn't exist
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Orders');
  
  if (!sheet) {
    sheet = ss.insertSheet('Orders');
    
    // Add headers
    const headers = [
      'Order ID',
      'Customer',
      'Email',
      'Package',
      'Amount',
      'Status',
      'Payment Status',
      'Payment Method',
      'Transaction ID',
      'Notes',
      'Platforms',
      'Date Created',
      'Video Files',
      'Last Updated'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#FF4E1F');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    
    // Set column widths
    sheet.setColumnWidth(1, 100);   // Order ID
    sheet.setColumnWidth(2, 120);   // Customer
    sheet.setColumnWidth(3, 150);   // Email
    sheet.setColumnWidth(4, 150);   // Package
    sheet.setColumnWidth(5, 80);    // Amount
    sheet.setColumnWidth(6, 100);   // Status
    sheet.setColumnWidth(7, 120);   // Payment Status
    sheet.setColumnWidth(8, 120);   // Payment Method
    sheet.setColumnWidth(9, 120);   // Transaction ID
    sheet.setColumnWidth(10, 150);  // Notes
    sheet.setColumnWidth(11, 150);  // Platforms
    sheet.setColumnWidth(12, 120);  // Date Created
    sheet.setColumnWidth(13, 150);  // Video Files
    sheet.setColumnWidth(14, 120);  // Last Updated
  }
  
  return sheet;
}

// ==================================================
// ADD NEW ORDER
// ==================================================

function addOrder(data) {
  const sheet = setupSheet();
  
  // Generate Order ID
  const lastRow = sheet.getLastRow();
  const orderNumber = String(lastRow).padStart(3, '0');
  const orderId = 'ORD-' + orderNumber;
  
  // Prepare row data
  const row = [
    orderId,                          // Order ID
    data.name || '',                  // Customer
    data.email || '',                 // Email
    data.package || '',               // Package
    extractAmount(data.package),      // Amount
    'pending',                        // Status (default: pending)
    'pending',                        // Payment Status (default: pending)
    data.paymentMethod || '',         // Payment Method
    '',                               // Transaction ID (empty initially)
    data.notes || '',                 // Notes
    data.platforms || '',             // Platforms
    new Date().toLocaleDateString(),  // Date Created
    data.videoFiles || '',            // Video Files
    new Date().toLocaleString()       // Last Updated
  ];
  
  sheet.appendRow(row);
  
  return {
    success: true,
    orderId: orderId,
    message: 'Order created successfully'
  };
}

// ==================================================
// UPDATE PAYMENT STATUS
// ==================================================

function updatePayment(orderId, paymentStatus, paymentMethod, transactionId, notes) {
  const sheet = setupSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      sheet.getRange(i + 1, 7).setValue(paymentStatus);      // Payment Status
      sheet.getRange(i + 1, 8).setValue(paymentMethod);      // Payment Method
      sheet.getRange(i + 1, 9).setValue(transactionId);      // Transaction ID
      sheet.getRange(i + 1, 10).setValue(notes);             // Notes
      sheet.getRange(i + 1, 14).setValue(new Date().toLocaleString()); // Last Updated
      
      // Add note entry
      addNote(orderId, `Payment updated: ${paymentStatus} via ${paymentMethod}`);
      
      return {
        success: true,
        message: 'Payment updated successfully'
      };
    }
  }
  
  return {
    success: false,
    message: 'Order not found'
  };
}

// ==================================================
// UPDATE ORDER STATUS
// ==================================================

function updateOrderStatus(orderId, status) {
  const sheet = setupSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      sheet.getRange(i + 1, 6).setValue(status);             // Status
      sheet.getRange(i + 1, 14).setValue(new Date().toLocaleString()); // Last Updated
      
      addNote(orderId, `Status updated to: ${status}`);
      
      return {
        success: true,
        message: 'Order status updated'
      };
    }
  }
  
  return {
    success: false,
    message: 'Order not found'
  };
}

// ==================================================
// GET ALL ORDERS
// ==================================================

function getAllOrders() {
  const sheet = setupSheet();
  const data = sheet.getDataRange().getValues();
  const orders = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    orders.push({
      id: data[i][0],
      customer: data[i][1],
      email: data[i][2],
      package: data[i][3],
      amount: data[i][4],
      status: data[i][5],
      payment: data[i][6],
      method: data[i][7],
      transactionId: data[i][8],
      notes: data[i][9],
      platforms: data[i][10],
      dateCreated: data[i][11],
      videoFiles: data[i][12],
      lastUpdated: data[i][13]
    });
  }
  
  return orders;
}

// ==================================================
// GET ORDER BY ID
// ==================================================

function getOrder(orderId) {
  const sheet = setupSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      return {
        id: data[i][0],
        customer: data[i][1],
        email: data[i][2],
        package: data[i][3],
        amount: data[i][4],
        status: data[i][5],
        payment: data[i][6],
        method: data[i][7],
        transactionId: data[i][8],
        notes: data[i][9],
        platforms: data[i][10],
        dateCreated: data[i][11],
        videoFiles: data[i][12],
        lastUpdated: data[i][13]
      };
    }
  }
  
  return null;
}

// ==================================================
// ADD NOTE (Activity Log)
// ==================================================

function addNote(orderId, note) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let notesSheet = ss.getSheetByName('Activity Log');
  
  if (!notesSheet) {
    notesSheet = ss.insertSheet('Activity Log');
    const headers = ['Order ID', 'Action', 'Timestamp'];
    notesSheet.getRange(1, 1, 1, 3).setValues([headers]);
    
    const headerRange = notesSheet.getRange(1, 1, 1, 3);
    headerRange.setBackground('#FF4E1F');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
  }
  
  notesSheet.appendRow([
    orderId,
    note,
    new Date().toLocaleString()
  ]);
}

// ==================================================
// HELPER FUNCTION: Extract Amount from Package
// ==================================================

function extractAmount(packageString) {
  const match = packageString.match(/\$(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// ==================================================
// WEB APP ENDPOINT - Handle POST/GET Requests
// ==================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let response;
    
    switch(action) {
      case 'addOrder':
        response = addOrder(data);
        break;
      
      case 'updatePayment':
        response = updatePayment(
          data.orderId,
          data.paymentStatus,
          data.paymentMethod,
          data.transactionId,
          data.notes
        );
        break;
      
      case 'updateStatus':
        response = updateOrderStatus(data.orderId, data.status);
        break;
      
      case 'getOrders':
        response = {
          success: true,
          orders: getAllOrders()
        };
        break;
      
      case 'getOrder':
        const order = getOrder(data.orderId);
        response = order ? 
          { success: true, order: order } : 
          { success: false, message: 'Order not found' };
        break;
      
      default:
        response = { success: false, message: 'Unknown action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'ClipForge API is running',
      endpoints: [
        'POST: addOrder',
        'POST: updatePayment',
        'POST: updateStatus',
        'POST: getOrders',
        'POST: getOrder'
      ]
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================================================
// TRIGGER SETUP (Optional - Auto-sync)
// ==================================================

function setupTriggers() {
  // This runs once to set up time-based triggers
  ScriptApp.newTrigger('syncWithPaymentTracker')
    .timeBased()
    .everyMinutes(5)
    .create();
}

function syncWithPaymentTracker() {
  // This function runs every 5 minutes to sync data
  const orders = getAllOrders();
  
  // Log sync event
  Logger.log('Synced ' + orders.length + ' orders at ' + new Date());
}
