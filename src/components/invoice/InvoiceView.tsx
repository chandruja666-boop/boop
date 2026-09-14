import React, { useState } from 'react';
import { Printer, ArrowLeft, ShieldCheck, Download, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';

export const InvoiceView: React.FC = () => {
  const { selectedOrderId, orders, invoiceToPrint, setCurrentView, showToast, invoiceSettings } = useApp();
  const [downloaded, setDownloaded] = useState(false);

  const order =
    (selectedOrderId
      ? orders.find((o) => o.id === selectedOrderId) || storage.getOrderById(selectedOrderId)
      : null) ||
    invoiceToPrint ||
    orders[0] ||
    storage.getOrders()[0];

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-stone-600 font-medium">No order found for invoice generation.</p>
        <button
          id="invoice-empty-go-orders-btn"
          onClick={() => setCurrentView('account')}
          className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
        >
          Go to Orders
        </button>
      </div>
    );
  }

  const invoiceNumber = `INV-${(order.id || 'ORDER').replace('CP-', '')}`;
  const cgst = Math.round((order.tax || 0) / 2);
  const sgst = Math.round((order.tax || 0) / 2);

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Browser print dialog blocked:', err);
      showToast('Print dialog unavailable in preview. Downloading offline invoice bill...', 'info');
      handleDownloadBill();
    }
  };

  const handleDownloadBill = () => {
    try {
      const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CP Furniture Tax Invoice - ${invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 28px; color: #1c1917; background: #fff; line-height: 1.5; font-size: 12px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e7e5e4; padding-bottom: 16px; margin-bottom: 20px; }
    .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .brand span { color: #78350f; font-weight: 300; letter-spacing: 2px; }
    .invoice-title { background: #1c1917; color: #fde68a; padding: 4px 10px; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 11px; text-transform: uppercase; }
    .grid-2 { display: flex; justify-content: space-between; margin-bottom: 24px; gap: 20px; }
    .col { flex: 1; }
    .col-title { font-weight: bold; text-transform: uppercase; font-size: 10px; color: #a8a29e; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { text-align: left; padding: 8px 6px; border-bottom: 2px solid #a8a29e; font-size: 10px; text-transform: uppercase; color: #57534e; }
    td { padding: 10px 6px; border-bottom: 1px solid #e7e5e4; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals { width: 280px; margin-left: auto; margin-bottom: 24px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .grand-total { border-top: 2px solid #1c1917; padding-top: 8px; font-size: 14px; font-weight: 900; color: #451a03; }
    .footer { border-top: 1px solid #e7e5e4; padding-top: 16px; font-size: 10px; color: #78716c; display: flex; justify-content: space-between; align-items: flex-end; }
    .stamp { font-style: italic; font-weight: bold; font-size: 13px; color: #1c1917; border-top: 1px solid #a8a29e; padding-top: 4px; margin-top: 8px; }
    .action-bar { margin-bottom: 20px; padding: 12px; background: #f5f5f4; border-radius: 8px; text-align: right; }
    .btn { background: #1c1917; color: #fff; padding: 8px 16px; font-size: 12px; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">Print this Tax Invoice (PDF)</button>
  </div>
  <div class="header">
    <div>
      <div class="brand">CP <span>FURNITURE</span></div>
      <p style="margin: 2px 0; font-weight: 600;">${invoiceSettings.companyName}</p>
      <p style="margin: 2px 0; color: #57534e;">${invoiceSettings.registeredOfficeAddress}</p>
      <p style="margin: 2px 0; color: #57534e;">GSTIN: ${invoiceSettings.gstin} | CIN: ${invoiceSettings.cin}</p>
      <p style="margin: 2px 0; color: #78350f; font-size: 10px; font-weight: bold;">Payment Gateway: Razorpay (razorpay.me/@anandhanchandru)</p>
    </div>
    <div style="text-align: right;">
      <div class="invoice-title">${invoiceSettings.invoiceHeader}</div>
      <p style="margin: 4px 0; font-weight: bold; font-family: monospace;">${invoiceNumber}</p>
      <p style="margin: 2px 0; color: #57534e;">Date: ${order.orderDate || order.date || 'Recent'}</p>
      <p style="margin: 2px 0; color: #57534e;">Order ID: ${order.id}</p>
      <p style="margin: 2px 0; color: #047857; font-weight: bold;">Status: ${order.paymentStatus} (${order.paymentMethod})</p>
      ${order.razorpayPaymentId ? `<p style="margin: 2px 0; font-family: monospace; font-size: 10px; color: #b45309;">Razorpay Txn: ${order.razorpayPaymentId}</p>` : ''}
      <p style="margin: 2px 0; font-size: 10px; color: #059669;">Settlement: Direct Bank Settled</p>
    </div>
  </div>

  <div class="grid-2">
    <div class="col">
      <div class="col-title">Billed & Shipped To:</div>
      <p style="margin: 2px 0; font-weight: bold; font-size: 13px;">${order.shippingAddress?.name || order.customerName}</p>
      <p style="margin: 2px 0; color: #57534e;">${order.shippingAddress?.street || ''}</p>
      <p style="margin: 2px 0; color: #57534e;">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}</p>
      <p style="margin: 2px 0; color: #57534e;">Phone: ${order.shippingAddress?.phone || order.customerPhone || ''}</p>
      <p style="margin: 2px 0; color: #57534e;">Email: ${order.customerEmail || ''}</p>
      ${order.shippingAddress?.gstin ? `<p style="margin: 2px 0; color: #78350f; font-weight: 600;">Customer GSTIN: ${order.shippingAddress.gstin}</p>` : ''}
    </div>
    <div class="col" style="text-align: right;">
      <div class="col-title">Fulfillment Hub:</div>
      <p style="margin: 2px 0; font-weight: bold;">${invoiceSettings.fulfillmentCenterName}</p>
      <p style="margin: 2px 0; color: #57534e;">${invoiceSettings.warehouseAddress}</p>
      <p style="margin: 2px 0; color: #57534e;">Delivery Window: ${invoiceSettings.deliveryWindowText}</p>
      <p style="margin: 2px 0; color: #57534e; font-style: italic;">Dispatch: ${invoiceSettings.dispatchNote}</p>
      <p style="margin: 2px 0; color: #047857; font-weight: bold;">10-Year Hardwood Warranty Active</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 24px;">#</th>
        <th>Item Description</th>
        <th>HSN</th>
        <th class="text-center">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${(order.items || [])
          .map(
            (item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <strong>${item.productName || item.name}</strong>
            <br/><span style="color: #78716c; font-size: 10px;">SKU: ${item.sku} ${(item.selectedColor || item.color) ? '| ' + (item.selectedColor || item.color) : ''} ${(item.selectedSize || item.size) ? '| ' + (item.selectedSize || item.size) : ''}</span>
          </td>
          <td style="font-family: monospace;">9403</td>
          <td class="text-center font-bold">${item.quantity || 1}</td>
          <td class="text-right font-mono">₹${(item.price || 0).toLocaleString()}</td>
          <td class="text-right font-mono" style="font-weight: bold;">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
        </tr>
      `
          )
          .join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Items Subtotal:</span><span style="font-family: monospace;">₹${(order.subtotal || 0).toLocaleString()}</span></div>
    ${(order.discount || 0) > 0 ? `<div class="totals-row" style="color: #047857;"><span>Total Savings:</span><span style="font-family: monospace;">-₹${(order.discount || 0).toLocaleString()}</span></div>` : ''}
    <div class="totals-row"><span>Assembly & Delivery:</span><span style="color: #047857; font-weight: bold;">FREE</span></div>
    <div class="totals-row" style="color: #78716c; font-size: 11px;"><span>CGST (9%):</span><span style="font-family: monospace;">₹${(cgst || 0).toLocaleString()}</span></div>
    <div class="totals-row" style="color: #78716c; font-size: 11px;"><span>SGST (9%):</span><span style="font-family: monospace;">₹${(sgst || 0).toLocaleString()}</span></div>
    <div class="totals-row grand-total"><span>Grand Total:</span><span style="font-family: monospace;">₹${(order.total ?? order.grandTotal ?? 0).toLocaleString()}</span></div>
  </div>

  <div class="footer">
    <div>
      <p style="margin: 2px 0; font-weight: bold;">Thank you for choosing CP Furniture.</p>
      <p style="margin: 2px 0;">Helpline: 1800-419-8989 | concierge@cpfurniture.com</p>
    </div>
    <div style="text-align: right;">
      <div class="stamp">CP Furniture Authorised Signatory</div>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CP-Furniture-Invoice-${invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      showToast('Tax invoice bill file downloaded successfully!', 'success');
      setTimeout(() => setDownloaded(false), 3000);
    } catch (e) {
      console.error('Download bill failed:', e);
      showToast('Failed to download bill file.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top action bar (hidden in print) */}
      <div className="no-print print:hidden flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
        <button
          id="invoice-back-btn"
          onClick={() => setCurrentView('account')}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account Orders</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="invoice-download-bill-btn"
            onClick={handleDownloadBill}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-2 border border-stone-300 transition-colors"
            title="Download offline tax invoice document"
          >
            {downloaded ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-stone-700" />}
            <span>{downloaded ? 'Downloaded' : 'Download Bill'}</span>
          </button>

          <button
            id="invoice-print-btn"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-md text-stone-800 text-xs"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-stone-300">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl font-black tracking-tighter text-stone-900 font-serif-luxury">CP</span>
              <span className="text-2xl font-light tracking-widest text-amber-900 uppercase">FURNITURE</span>
            </div>
            <p className="text-stone-600 font-medium">{invoiceSettings.companyName}</p>
            <p className="text-stone-500">{invoiceSettings.registeredOfficeAddress}</p>
            <p className="text-stone-500 font-mono mt-1">
              <strong>GSTIN:</strong> {invoiceSettings.gstin} | <strong>CIN:</strong> {invoiceSettings.cin}
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-stone-900 text-amber-300 font-bold uppercase tracking-wider text-[11px] rounded mb-1">
              {invoiceSettings.invoiceHeader}
            </span>
            <p className="font-bold text-stone-900 text-sm font-mono">Invoice No: {invoiceNumber}</p>
            <p className="text-stone-500">Invoice Date: {order.orderDate || order.date || 'Recent'}</p>
            <p className="text-stone-500">Order ID: <strong className="font-mono">{order.id}</strong></p>
            <p className="text-stone-500">
              Payment: <strong className="uppercase text-emerald-700">{order.paymentMethod} ({order.paymentStatus})</strong>
            </p>
            {order.razorpayPaymentId && (
              <p className="text-[11px] font-mono text-amber-900">
                Razorpay Txn: <strong className="text-stone-800">{order.razorpayPaymentId}</strong>
              </p>
            )}
            <p className="text-[11px] text-emerald-700 font-medium">
              Settlement: Direct Bank Settlement (razorpay.me/@anandhanchandru)
            </p>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-stone-200">
          <div>
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] mb-1 text-stone-400">
              Billed & Shipped To:
            </h4>
            <p className="font-bold text-stone-900 text-sm">{order.shippingAddress?.name || order.customerName}</p>
            <p className="text-stone-600 leading-snug">{order.shippingAddress?.street}</p>
            <p className="text-stone-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            <p className="text-stone-500 mt-1">Contact: {order.shippingAddress?.phone || order.customerPhone}</p>
            <p className="text-stone-500">Email: {order.customerEmail}</p>
            {order.shippingAddress?.gstin && (
              <p className="text-amber-900 font-semibold">Customer GSTIN: {order.shippingAddress.gstin}</p>
            )}
          </div>

          <div className="sm:text-right space-y-1">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] mb-1 text-stone-400">
              Fulfillment Center:
            </h4>
            <p className="font-bold text-stone-900">{invoiceSettings.fulfillmentCenterName}</p>
            <p className="text-stone-600">{invoiceSettings.warehouseAddress}</p>
            <p className="text-stone-500">{invoiceSettings.dispatchNote}</p>
            <p className="text-stone-500">Delivery Window: {invoiceSettings.deliveryWindowText}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-300 text-[11px] font-bold text-stone-600 uppercase">
                <th className="py-2.5">#</th>
                <th className="py-2.5">Description & Specification</th>
                <th className="py-2.5">HSN Code</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Rate (₹)</th>
                <th className="py-2.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {(order.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 text-stone-400">{idx + 1}</td>
                  <td className="py-3">
                    <p className="font-bold text-stone-900">{item.productName || item.name}</p>
                    <p className="text-[10px] text-stone-500">
                      SKU: {item.sku} {(item.selectedColor || item.color) ? `| Finish: ${item.selectedColor || item.color}` : ''}{' '}
                      {(item.selectedSize || item.size) ? `| Size: ${item.selectedSize || item.size}` : ''}
                    </p>
                  </td>
                  <td className="py-3 font-mono text-stone-500">9403</td>
                  <td className="py-3 text-center font-bold">{item.quantity || 1}</td>
                  <td className="py-3 text-right font-mono">₹{(item.price || 0).toLocaleString()}</td>
                  <td className="py-3 text-right font-mono font-bold">
                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Calculations */}
        <div className="pt-4 border-t-2 border-stone-300 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="max-w-xs space-y-2 text-stone-600">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
              <p>
                <strong>10-Year Warranty Active:</strong> Retain this tax invoice as valid proof of warranty for on-site showroom service.
              </p>
            </div>
            <p className="text-[10px] text-stone-400">
              All wooden goods are certified FSC kiln-seasoned hardwoods free from defects and pest infestation.
            </p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-right">
            <div className="flex justify-between text-stone-600">
              <span>Items Subtotal:</span>
              <span className="font-mono">₹{(order.subtotal || 0).toLocaleString()}</span>
            </div>

            {(order.discount || 0) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Total Savings:</span>
                <span className="font-mono">-₹{(order.discount || 0).toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>White-Glove Assembly:</span>
              <span className="text-emerald-700 font-bold">FREE (₹0)</span>
            </div>

            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>CGST (9%):</span>
              <span className="font-mono">₹{(cgst || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>SGST (9%):</span>
              <span className="font-mono">₹{(sgst || 0).toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline text-sm font-bold text-stone-900">
              <span>Grand Total:</span>
              <span className="text-lg font-black text-amber-950 font-mono">
                ₹{(order.total ?? order.grandTotal ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Authorized Signatory */}
        <div className="pt-10 mt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-end text-stone-500 text-[11px]">
          <div>
            <p>Thank you for choosing CP Furniture.</p>
            <p>Customer Support: 1800-419-8989 &bull; concierge@cpfurniture.com</p>
          </div>
          <div className="text-right mt-4 sm:mt-0">
            <p className="font-serif-luxury italic text-stone-800 text-sm font-bold">CP Furniture Authorised</p>
            <p className="border-t border-stone-400 pt-1 mt-2">Authorised Signatory / Central Hub</p>
          </div>
        </div>
      </div>
    </div>
  );
};

