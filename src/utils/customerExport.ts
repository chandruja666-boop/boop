import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, Order } from '../types';

/**
 * Formats a currency value as Indian Rupees
 */
function formatRupee(amount: number): string {
  return 'INR ' + amount.toLocaleString('en-IN');
}

/**
 * Formats a Date string into a beautiful display format
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Export Customer Details and purchase records to Excel
 */
export function exportCustomersToExcel(customers: Customer[], orders: Order[]): void {
  try {
    // Sheet 1: Customer Directory Overview
    const customerRows = customers.map((c) => {
      // Find orders for this customer
      const custOrders = orders.filter((o) => o.customerId === c.id);
      const successfulOrders = custOrders.filter((o) => o.orderStatus?.toLowerCase() !== 'cancelled');
      
      const totalSpent = successfulOrders.reduce((sum, o) => sum + (o.grandTotal ?? o.total ?? 0), 0);
      const skuList = Array.from(new Set(
        custOrders.flatMap((o) => (o.items || []).map((it) => it.sku || 'N/A'))
      )).join(', ');

      const formattedAddresses = (c.addresses || [])
        .map((a) => `[${a.type || 'Address'}] ${a.name}, Phone: ${a.phone}, ${a.street}, ${a.city}, ${a.state} - ${a.pincode}`)
        .join(' | ');

      return {
        'Customer ID': c.id,
        'Name': c.name,
        'Email Address': c.email,
        'Contact Phone': c.phone,
        'Registration Date': formatDate(c.createdAt),
        'Total Spent (INR)': totalSpent,
        'Lifetime Orders Count': custOrders.length,
        'Fulfilled/Active Orders': successfulOrders.length,
        'Purchased SKUs': skuList || 'None',
        'Saved Delivery Addresses': formattedAddresses || 'No address saved'
      };
    });

    // Sheet 2: Date-wise Item Purchase History
    const purchaseRows: any[] = [];
    orders.forEach((o) => {
      const cust = customers.find((c) => c.id === o.customerId) || {
        name: o.customerName || 'Walk-in VIP',
        email: o.customerEmail || 'N/A',
        phone: o.customerPhone || 'N/A'
      };

      (o.items || []).forEach((item) => {
        purchaseRows.push({
          'Customer ID': o.customerId || 'N/A',
          'Customer Name': cust.name,
          'Customer Email': cust.email,
          'Customer Phone': cust.phone,
          'Order Number': o.orderNumber ? `#${o.orderNumber}` : o.id,
          'Order Date': formatDate(o.orderDate || o.date),
          'SKU': item.sku || 'N/A',
          'Product Name': item.productName || item.name,
          'Unit Price (INR)': item.price,
          'Quantity Ordered': item.quantity,
          'Subtotal (INR)': item.subtotal || (item.price * item.quantity),
          'Payment Method': o.paymentMethod || 'Online',
          'Order Fulfillment Status': o.orderStatus || 'Pending'
        });
      });
    });

    // Create workbook & sheets
    const wb = XLSX.utils.book_new();
    
    const wsCustomers = XLSX.utils.json_to_sheet(customerRows);
    const wsPurchases = XLSX.utils.json_to_sheet(purchaseRows);

    // Set nice column widths for Customer Directory
    const customerColWidths = [
      { wch: 18 }, // Customer ID
      { wch: 22 }, // Name
      { wch: 28 }, // Email
      { wch: 15 }, // Phone
      { wch: 22 }, // Reg Date
      { wch: 18 }, // Total Spent
      { wch: 20 }, // Lifetime Orders
      { wch: 22 }, // Active Orders
      { wch: 30 }, // Purchased SKUs
      { wch: 60 }  // Addresses
    ];
    wsCustomers['!cols'] = customerColWidths;

    // Set column widths for Purchases Sheet
    const purchaseColWidths = [
      { wch: 18 }, // Customer ID
      { wch: 22 }, // Name
      { wch: 28 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Order Number
      { wch: 22 }, // Order Date
      { wch: 15 }, // SKU
      { wch: 30 }, // Product Name
      { wch: 18 }, // Unit Price
      { wch: 16 }, // Quantity
      { wch: 18 }, // Subtotal
      { wch: 16 }, // Payment Method
      { wch: 22 }  // Status
    ];
    wsPurchases['!cols'] = purchaseColWidths;

    XLSX.utils.book_append_sheet(wb, wsCustomers, 'Customer Directory');
    XLSX.utils.book_append_sheet(wb, wsPurchases, 'Fulfillment & Purchased SKUs');

    // Trigger download
    XLSX.writeFile(wb, `CP_Furniture_Customer_Directory_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (error) {
    console.error('Error generating customers Excel report:', error);
    throw error;
  }
}

/**
 * Export Customer Details and purchase records to PDF
 */
export function exportCustomersToPDF(customers: Customer[], orders: Order[]): void {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape format is much better for tabular customer sheets
    const timestamp = formatDate(new Date().toISOString());

    // 1. Luxury Dark Header Panel (matching CP Furniture's dark/gold look)
    doc.setFillColor(28, 25, 23); // charcoal (#1c1917)
    doc.rect(0, 0, 297, 36, 'F');

    // Gold decorative border strip
    doc.setFillColor(217, 119, 6); // amber-600
    doc.rect(0, 36, 297, 2.5, 'F');

    // Title & Brand
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text('CASA PRESTIGE FURNITURE', 15, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11); // Gold text (#f59e0b)
    doc.text('VIP CUSTOMER DIRECTORY & LIFETIME VALUE INSIGHTS', 15, 22);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(168, 162, 158); // warm grey text
    doc.text(`Report Generated On: ${timestamp} | Secure Cloud Database Audit`, 15, 30);

    // Summary Card Stats at the right end of the header
    doc.setFillColor(41, 37, 36); // lighter warm stone grey
    doc.roundedRect(210, 6, 72, 24, 3, 3, 'F');

    doc.setTextColor(217, 119, 6); // gold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const activeOrdersSum = orders.filter(o => o.orderStatus?.toLowerCase() !== 'cancelled').length;
    doc.text(`${customers.length}`, 215, 13);
    doc.text(`${activeOrdersSum}`, 250, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(244, 244, 245);
    doc.text('Active VIPs', 215, 18);
    doc.text('Orders Cleared', 250, 18);

    doc.setTextColor(168, 162, 158);
    doc.text('Status: Synchronized', 215, 26);

    // 2. Build the primary Customer Directory table
    const tableRows = customers.map((c, index) => {
      const custOrders = orders.filter((o) => o.customerId === c.id);
      const successfulOrders = custOrders.filter((o) => o.orderStatus?.toLowerCase() !== 'cancelled');
      const totalSpent = successfulOrders.reduce((sum, o) => sum + (o.grandTotal ?? o.total ?? 0), 0);
      
      const lastOrder = custOrders.length > 0 
        ? custOrders.sort((a, b) => new Date(b.orderDate || b.date).getTime() - new Date(a.orderDate || a.date).getTime())[0]
        : null;

      const dateStr = lastOrder ? formatDate(lastOrder.orderDate || lastOrder.date).split(',')[0] : 'No Order';
      
      const distinctSKUs = Array.from(new Set(
        custOrders.flatMap((o) => (o.items || []).map((it) => it.sku || ''))
      )).filter(Boolean);

      const itemsPurchasedCount = custOrders.reduce((sum, o) => sum + (o.items || []).reduce((s, it) => s + it.quantity, 0), 0);

      // Extract delivery city & phone
      const phoneNo = c.phone || 'N/A';
      const addressCities = Array.from(new Set(
        (c.addresses || []).map((a) => a.city || 'Bengaluru')
      )).join(', ') || 'N/A';

      return [
        index + 1,
        `${c.name}\n${c.email}`,
        phoneNo,
        formatDate(c.createdAt).split(',')[0],
        addressCities,
        `${custOrders.length} orders\n(${itemsPurchasedCount} items)`,
        distinctSKUs.slice(0, 3).join(', ') + (distinctSKUs.length > 3 ? ` (+${distinctSKUs.length - 3})` : ''),
        formatRupee(totalSpent),
        dateStr
      ];
    });

    autoTable(doc, {
      startY: 44,
      head: [[
        'S.No',
        'Customer Profile (Name & Email)',
        'Phone',
        'Registered',
        'Delivery Hubs',
        'Volume',
        'Purchased SKUs (Top)',
        'Total Spent',
        'Last Active'
      ]],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [28, 25, 23], // matching charcoal
        textColor: [245, 158, 11], // matching gold
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left',
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [41, 37, 36],
        cellPadding: 2.5,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 55, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 22 },
        4: { cellWidth: 35 },
        5: { cellWidth: 28 },
        6: { cellWidth: 48 },
        7: { cellWidth: 48, fontStyle: 'bold', textColor: [180, 83, 9] }, // warm amber
        8: { cellWidth: 25 }
      },
      alternateRowStyles: {
        fillColor: [252, 251, 250] // warm cream white tint
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        // Add footer on each page
        const str = 'Page ' + doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(120, 113, 108);
        doc.setFont('helvetica', 'normal');
        doc.text('Casa Prestige Furniture Backoffice Admin Panel • Confidential Report', 10, doc.internal.pageSize.height - 8);
        doc.text(str, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 8);
      }
    });

    // Save PDF
    doc.save(`CP_Furniture_Customer_Directory_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('Error generating customers PDF report:', error);
    throw error;
  }
}
