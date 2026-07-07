# Kishor Electronics — Setup

## 1. Product data (Google Sheet CSV)

In your Google Sheet **Products** tab, use these column headers in row 1:

```
Product ID | Category | Product Name | Tag | Product Price | Discount |
Discounted Price | Product Stock | Picture1 | Picture2 | Picture3 |
Description | Instagram Product Link | Active
```

Only rows with `Active = YES` are displayed. `Tag` accepts `HOT`, `NEW`, or `SALE`.

File → Share → **Publish to web** → choose the Products sheet → CSV. Copy the URL and set it in either:

- `src/lib/config.ts` → `SHEET_CSV_URL`, **or**
- an env var `VITE_SHEET_CSV_URL`

## 2. Orders (Google Apps Script)

Create a tab called **Orders**. In the sheet: **Extensions → Apps Script**, paste this code and **Deploy → Web app** (Execute as: Me, Access: Anyone):

```js
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.action === 'createOrder') {
    const o = body.order;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Order ID','Created At','Name','Phone','Email','Address','City','Pincode','Notes','Items','Subtotal','Total']);
    }
    const items = o.items.map(i => i.name + ' x' + i.quantity + ' @ ' + i.price).join(' | ');
    sheet.appendRow([o.orderId,o.createdAt,o.customer.name,o.customer.phone,o.customer.email||'',o.customer.address,o.customer.city,o.customer.pincode,o.customer.notes||'',items,o.subtotal,o.total]);
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ok:false})).setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) {
  if (e.parameter.action === 'listOrders') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({orders:[]})).setMimeType(ContentService.MimeType.JSON);
    const rows = sheet.getDataRange().getValues().slice(1);
    const orders = rows.map(r => ({
      orderId:r[0], createdAt:r[1],
      customer:{name:r[2],phone:r[3],email:r[4],address:r[5],city:r[6],pincode:r[7],notes:r[8]},
      items:String(r[9]||'').split(' | ').map(s => {
        const m = s.match(/^(.*) x(\d+) @ (\d+(?:\.\d+)?)$/);
        return m ? {name:m[1],quantity:+m[2],price:+m[3]} : {name:s,quantity:1,price:0};
      }),
      subtotal:+r[10]||0, total:+r[11]||0,
    }));
    return ContentService.createTextOutput(JSON.stringify({orders})).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('OK');
}
```

Copy the Web App URL into `src/lib/config.ts` → `APPS_SCRIPT_URL` (or set `VITE_APPS_SCRIPT_URL`).

## 3. WhatsApp

Checkout opens `wa.me/919407123853` with a formatted summary. Change the number in `src/lib/config.ts` → `STORE.whatsappNumber`.

## Future

The checkout, orders, and product layers are modular. A payment gateway or DB migration can plug into `src/lib/orders.ts` without touching the storefront.