const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function priceOrder(items, coupon) {
  const billed = pricing.computeTotals(items, coupon);

  return {
    id: 9001,
    date: '22/11/2026',
    customer: 'In-memory customer',
    paymentMode: 'cash',
    status: 'completed',
    items,
    coupon,
    subtotal: billed.subtotal,
    discount: billed.discount,
    tax: billed.tax,
    total: billed.total
  };
}

test('invoice uses the billed HSN slab and GST breakdown', () => {
  const items = [
    { id: 1, sku: 'GRN-001', name: 'Rice', hsn: '1006', price: 100, qty: 1 }
  ];
  const billed = pricing.computeTotals(items, '');
  const order = priceOrder(items, '');
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const renderedInvoice = invoice.render(order);

  assert.deepEqual(
    {
      billedTax: billed.tax,
      billedCgst: billed.cgst,
      billedSgst: billed.sgst,
      billedTotal: billed.total,
      invoiceRate: invoiceFigures.rows[0].gstPercent,
      invoiceTax: invoiceFigures.tax,
      invoiceCgst: invoiceFigures.cgst,
      invoiceSgst: invoiceFigures.sgst,
      invoiceTotal: invoiceFigures.total
    },
    {
      billedTax: 5,
      billedCgst: 2.5,
      billedSgst: 2.5,
      billedTotal: 105,
      invoiceRate: 5,
      invoiceTax: 5,
      invoiceCgst: 2.5,
      invoiceSgst: 2.5,
      invoiceTotal: 105
    }
  );
  assert.match(renderedInvoice, /<td class="r">5%<\/td>/);
  assert.match(renderedInvoice, /CGST \+ SGST \(Total GST\)<\/td><td class="r">₹5\.00<\/td>/);
  assert.match(renderedInvoice, /Invoice Total<\/td><td class="r">₹105\.00<\/td>/);
  assert.doesNotMatch(renderedInvoice, /differs from Order Ledger recorded total/);
});

test('invoice applies SAVE10 and post-discount GST the same as order pricing', () => {
  const items = [
    { id: 8, sku: 'BEV-001', name: 'Tea', hsn: '0902', price: 100, qty: 30 }
  ];
  const billed = pricing.computeTotals(items, 'SAVE10');
  const order = priceOrder(items, 'SAVE10');
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const renderedInvoice = invoice.render(order);

  assert.deepEqual(
    {
      billedDiscount: billed.discount,
      billedTax: billed.tax,
      billedLineTax: billed.lines[0].tax,
      billedCgst: billed.cgst,
      billedSgst: billed.sgst,
      billedTotal: billed.total,
      invoiceDiscount: invoiceFigures.discount,
      invoiceLineTax: invoiceFigures.rows[0].lineTax,
      invoiceTax: invoiceFigures.tax,
      invoiceCgst: invoiceFigures.cgst,
      invoiceSgst: invoiceFigures.sgst,
      invoiceTotal: invoiceFigures.total
    },
    {
      billedDiscount: 150,
      billedTax: 513,
      billedLineTax: 513,
      billedCgst: 256.5,
      billedSgst: 256.5,
      billedTotal: 3363,
      invoiceDiscount: 150,
      invoiceLineTax: 513,
      invoiceTax: 513,
      invoiceCgst: 256.5,
      invoiceSgst: 256.5,
      invoiceTotal: 3363
    }
  );
  assert.match(renderedInvoice, /Coupon Discount \(SAVE10\)<\/td><td class="r" style="color:#16a34a">-₹150\.00<\/td>/);
  assert.match(renderedInvoice, /Invoice Total<\/td><td class="r">₹3363\.00<\/td>/);
  assert.doesNotMatch(renderedInvoice, /differs from Order Ledger recorded total/);
});

test('invoice matches the billed HSN GST breakdown and total for a live-app order', () => {
  const items = [
    { id: 1, sku: 'GRN-001', name: 'Indrayani Basmati Rice 5kg', hsn: '1006', price: 640, qty: 1 }
  ];
  const billed = pricing.computeTotals(items, '');
  const invoiceFigures = invoice.computeInvoiceFigures(priceOrder(items, ''));

  assert.deepEqual(
    {
      gstPercent: invoiceFigures.rows[0].gstPercent,
      lineTax: invoiceFigures.rows[0].lineTax,
      tax: invoiceFigures.tax,
      cgst: invoiceFigures.cgst,
      sgst: invoiceFigures.sgst,
      total: invoiceFigures.total
    },
    {
      gstPercent: billed.lines[0].gstPercent,
      lineTax: billed.lines[0].tax,
      tax: billed.tax,
      cgst: billed.cgst,
      sgst: billed.sgst,
      total: billed.total
    }
  );
});
