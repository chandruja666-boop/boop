import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Category, Order, InventoryLog } from '../types';

/**
 * Utility to convert an image URL to a base64 Data URL for jsPDF embedding
 */
async function getBase64ImageFromUrl(url: string, timeoutMs: number = 3000): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      let timer: any = setTimeout(() => {
        resolve(null);
      }, timeoutMs);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const size = 100;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          // Draw image centered and cropped nicely
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        } catch {
          resolve(null);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };

      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Creates a fallback base64 thumbnail with product initials for PDF
 */
function createFallbackThumbnail(sku: string, category: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Elegant warm charcoal background
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, 0, 100, 100);
    // Gold border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 96, 96);
    // Text initials
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = (sku.split('-')[1] || category.substring(0, 3) || 'CPF').toUpperCase();
    ctx.fillText(text, 50, 50);
  }
  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Calculates inward and outward transaction statistics per product
 */
export function computeProductInventoryMetrics(
  products: Product[],
  logs: InventoryLog[],
  orders: Order[]
) {
  return products.map((p) => {
    const productLogs = logs.filter((l) => l.productId === p.id || l.sku === p.sku);
    
    // Inward stock (Stock In, Return Restock, manual additions)
    let totalInward = productLogs
      .filter((l) => l.quantityChange > 0)
      .reduce((acc, l) => acc + l.quantityChange, 0);

    // Outward stock (Order deductions, Stock Out)
    let totalOutward = Math.abs(
      productLogs
        .filter((l) => l.quantityChange < 0)
        .reduce((acc, l) => acc + l.quantityChange, 0)
    );

    // Also count sold units directly from orders if logs don't capture all historic orders
    const orderSoldUnits = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((acc, o) => {
        const item = o.items.find((it) => it.productId === p.id);
        return acc + (item ? item.quantity : 0);
      }, 0);

    if (orderSoldUnits > totalOutward) {
      totalOutward = orderSoldUnits;
    }

    if (totalInward === 0 && (p.stock + totalOutward) > 0) {
      totalInward = p.stock + totalOutward;
    }

    const valuation = p.stock * p.salePrice;
    const isLowStock = p.stock <= p.lowStockLimit;
    const isOutOfStock = p.stock === 0;

    return {
      product: p,
      totalInward,
      totalOutward,
      valuation,
      status: isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK ALERT' : 'HEALTHY IN STOCK',
      statusCode: isOutOfStock ? 'OOS' : isLowStock ? 'LOW' : 'OK'
    };
  });
}

/**
 * EXPORT 1: Comprehensive Excel (.XLSX) Export
 */
export function exportInventoryToExcel(
  products: Product[],
  categories: Category[],
  logs: InventoryLog[],
  orders: Order[]
) {
  const metrics = computeProductInventoryMetrics(products, logs, orders);
  const now = new Date();
  const timestampStr = now.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // 1. Sheet 1: Master Inventory Catalog
  const inventorySheetData = metrics.map((m, idx) => {
    const p = m.product;
    return {
      'S.No': idx + 1,
      'SKU Code': p.sku,
      'Furniture Title': p.name,
      'Department / Category': p.category,
      'Subcategory': p.subcategory || 'Standard Collection',
      'Material / Finish': p.material,
      'MRP Price (INR)': p.price,
      'Exclusive Sale Price (INR)': p.salePrice,
      'Discount %': p.discount || Math.round(((p.price - p.salePrice) / p.price) * 100),
      'Current In-Stock Units': p.stock,
      'Min Alert Threshold': p.lowStockLimit,
      'Total Purchased / Inward Units': m.totalInward,
      'Total Dispatched / Outward Units': m.totalOutward,
      'Current Stock Valuation (INR)': m.valuation,
      'Stock Status': m.status,
      'Rating': p.rating,
      'Review Count': p.reviewCount,
      'Dimensions (L x W x H)': `${p.dimensions.length} x ${p.dimensions.width} x ${p.dimensions.height} ${p.dimensions.unit}`,
      'Weight (kg)': p.weight,
      'Warranty': p.warranty,
      'Product Image URL': p.images[0] || ''
    };
  });

  // 2. Sheet 2: Purchasing Inward & Outward Register
  // Combine official logs and order dispatch events with timestamps
  const activityLogsData = logs.map((l, idx) => {
    const isPositive = l.quantityChange > 0;
    return {
      'Log ID': l.id,
      'Date & Time': l.date || timestampStr,
      'SKU': l.sku,
      'Furniture Product Name': l.productName,
      'Activity Type': l.type,
      'Inward / Outward Flow': isPositive ? 'INWARD (Purchasing / Restock)' : 'OUTWARD (Order / Dispatch)',
      'Quantity Delta (+/-)': l.quantityChange > 0 ? `+${l.quantityChange}` : `${l.quantityChange}`,
      'Previous Stock Units': l.previousStock,
      'Resulting Balance Stock': l.newStock,
      'Activity Reason & Reference': l.reason
    };
  });

  // If logs are brief, add order dispatch line items as outward records
  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      const p = products.find((pr) => pr.id === item.productId);
      activityLogsData.push({
        'Log ID': `ORD-DISPATCH-${ord.id}-${item.productId}`,
        'Date & Time': ord.orderDate || ord.date || timestampStr,
        'SKU': p?.sku || 'CP-FURN',
        'Furniture Product Name': item.productName || item.name || 'CP Furniture Piece',
        'Activity Type': 'Order Fulfillment Dispatch',
        'Inward / Outward Flow': 'OUTWARD (Order / Dispatch)',
        'Quantity Delta (+/-)': `-${item.quantity}`,
        'Previous Stock Units': (p?.stock ?? 0) + item.quantity,
        'Resulting Balance Stock': p?.stock ?? 0,
        'Activity Reason & Reference': `Customer Order #${ord.orderNumber || ord.id} (${ord.customerName} - ${ord.orderStatus})`
      });
    });
  });

  // 3. Sheet 3: Category & Department Valuation Summary
  const departmentData = categories.map((c, idx) => {
    const deptProducts = metrics.filter(
      (m) => m.product.category.toLowerCase() === c.name.toLowerCase() || m.product.category === c.name
    );
    const totalDeptSKUs = deptProducts.length;
    const totalDeptUnits = deptProducts.reduce((sum, m) => sum + m.product.stock, 0);
    const totalDeptValuation = deptProducts.reduce((sum, m) => sum + m.valuation, 0);
    const lowStockCount = deptProducts.filter((m) => m.statusCode !== 'OK').length;
    const totalInwardUnits = deptProducts.reduce((sum, m) => sum + m.totalInward, 0);
    const totalOutwardUnits = deptProducts.reduce((sum, m) => sum + m.totalOutward, 0);

    return {
      'S.No': idx + 1,
      'Department / Category': c.name,
      'Total Subcategories': c.subcategories.length,
      'Subcategories List': c.subcategories.join(', '),
      'Active Catalog SKUs': totalDeptSKUs,
      'Current In-Stock Units': totalDeptUnits,
      'Total Inward Purchased Units': totalInwardUnits,
      'Total Outward Sold Units': totalOutwardUnits,
      'Total Warehouse Asset Value (INR)': totalDeptValuation,
      'Low / Out of Stock Alerts': lowStockCount
    };
  });

  // Create Workbook
  const workbook = XLSX.utils.book_new();

  // Master Inventory Sheet
  const wsInventory = XLSX.utils.json_to_sheet(inventorySheetData);
  // Auto-fit column widths
  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 14 }, // SKU
    { wch: 38 }, // Title
    { wch: 22 }, // Category
    { wch: 20 }, // Subcategory
    { wch: 30 }, // Material
    { wch: 14 }, // MRP
    { wch: 16 }, // Exclusive Price
    { wch: 12 }, // Discount
    { wch: 14 }, // In-Stock
    { wch: 14 }, // Alert Limit
    { wch: 16 }, // Total Inward
    { wch: 16 }, // Total Outward
    { wch: 20 }, // Valuation
    { wch: 18 }, // Status
    { wch: 8 },  // Rating
    { wch: 12 }, // Review Count
    { wch: 18 }, // Dimensions
    { wch: 12 }, // Weight
    { wch: 20 }, // Warranty
    { wch: 45 }  // Image URL
  ];
  wsInventory['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(workbook, wsInventory, 'Master Inventory');

  // Purchasing & Movement Sheet
  const wsActivity = XLSX.utils.json_to_sheet(activityLogsData);
  wsActivity['!cols'] = [
    { wch: 24 }, // Log ID
    { wch: 20 }, // Date
    { wch: 14 }, // SKU
    { wch: 36 }, // Product Name
    { wch: 22 }, // Activity Type
    { wch: 25 }, // Inward / Outward Flow
    { wch: 16 }, // Quantity Delta
    { wch: 16 }, // Previous Stock
    { wch: 16 }, // Resulting Balance
    { wch: 45 }  // Reason
  ];
  XLSX.utils.book_append_sheet(workbook, wsActivity, 'Inward-Outward Register');

  // Department Valuation Sheet
  const wsDept = XLSX.utils.json_to_sheet(departmentData);
  wsDept['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 16 },
    { wch: 35 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsDept, 'Department Valuation');

  // Trigger File Download
  const fileDate = now.toISOString().split('T')[0];
  XLSX.writeFile(workbook, `CP_Furniture_Inventory_Report_${fileDate}.xlsx`);
}

/**
 * EXPORT 2: Luxury Styled PDF Report with Product Images, Inward/Outward Ledger, & Visual Badges
 */
export async function exportInventoryToPDF(
  products: Product[],
  categories: Category[],
  logs: InventoryLog[],
  orders: Order[],
  onProgress?: (msg: string) => void
) {
  if (onProgress) onProgress('Preparing high-resolution luxury PDF layout...');

  const metrics = computeProductInventoryMetrics(products, logs, orders);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalValuation = metrics.reduce((sum, m) => sum + m.valuation, 0);
  const totalUnitsInStock = metrics.reduce((sum, m) => sum + m.product.stock, 0);
  const totalInwardUnits = metrics.reduce((sum, m) => sum + m.totalInward, 0);
  const totalOutwardUnits = metrics.reduce((sum, m) => sum + m.totalOutward, 0);
  const alertCount = metrics.filter((m) => m.statusCode !== 'OK').length;

  // Pre-fetch product thumbnail base64 images (first 25 to ensure fast snappy export)
  if (onProgress) onProgress('Processing product image thumbnails...');
  const imageMap = new Map<string, string>();

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.images && p.images[0]) {
      try {
        const base64 = await getBase64ImageFromUrl(p.images[0], 2500);
        if (base64) {
          imageMap.set(p.id, base64);
        } else {
          imageMap.set(p.id, createFallbackThumbnail(p.sku, p.category));
        }
      } catch {
        imageMap.set(p.id, createFallbackThumbnail(p.sku, p.category));
      }
    } else {
      imageMap.set(p.id, createFallbackThumbnail(p.sku, p.category));
    }
  }

  if (onProgress) onProgress('Compiling inventory ledger & tables...');

  // Initialize Landscape A4 PDF for optimal luxury tabular layout
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper for drawing header banner
  const drawPageHeader = (pageNumber: number) => {
    // Luxury Top Bar (Deep Warm Charcoal)
    doc.setFillColor(28, 25, 23); // #1c1917
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Gold Accent Border
    doc.setFillColor(217, 119, 6); // #d97706
    doc.rect(0, 24, pageWidth, 1.2, 'F');

    // Brand Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CP FURNITURE', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(214, 211, 209); // #d6d3d1
    doc.text('LUXURY SOLID WOOD SHOWROOMS & TIMBER WORKSHOPS', 14, 18);

    // Document Title on Right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11); // #f59e0b
    doc.text('MASTER INVENTORY & VALUATION AUDIT', pageWidth - 14, 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(214, 211, 209);
    doc.text(`Generated: ${dateStr}, ${timeStr} | IST`, pageWidth - 14, 18, { align: 'right' });
  };

  // Helper for drawing footer
  const drawPageFooter = (pageNumber: number, totalPages: number) => {
    doc.setFillColor(245, 245, 244); // #f5f5f4
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

    doc.setDrawColor(231, 229, 228); // #e7e5e4
    doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 113, 108); // #78716c
    doc.text('CONFIDENTIAL — Internal CP Furniture Operations & Auditing Document. Bengaluru, India.', 14, pageHeight - 5);

    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 14, pageHeight - 5, { align: 'right' });
  };

  // Draw Page 1 Header
  drawPageHeader(1);

  // Executive Summary KPI Cards (Page 1)
  const startY = 30;
  const cardWidth = (pageWidth - 28 - (4 * 6)) / 5;
  const cardHeight = 20;

  const kpis = [
    { label: 'TOTAL INVENTORY VALUATION', val: `Rs. ${totalValuation.toLocaleString('en-IN')}`, sub: 'At exclusive showroom sale price', color: [217, 119, 6] },
    { label: 'LIVE STOCK UNITS', val: `${totalUnitsInStock} Units`, sub: `Across ${products.length} catalog items`, color: [16, 185, 129] },
    { label: 'PURCHASED INWARD', val: `${totalInwardUnits} Units`, sub: 'Workshops & factory arrivals', color: [59, 130, 246] },
    { label: 'DISPATCHED OUTWARD', val: `${totalOutwardUnits} Units`, sub: 'Customer orders & fulfillment', color: [168, 85, 247] },
    { label: 'LOW STOCK ATTENTION', val: `${alertCount} Alerts`, sub: alertCount > 0 ? 'Requires timber batch re-order' : 'All thresholds optimal', color: [225, 29, 72] }
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 6);
    // Background
    doc.setFillColor(250, 250, 249);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'F');
    // Border
    doc.setDrawColor(231, 229, 228);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'S');

    // Left accent colored bar
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.rect(x, startY, 2, cardHeight, 'F');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 113, 108);
    doc.text(kpi.label, x + 5, startY + 5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(28, 25, 23);
    doc.text(kpi.val, x + 5, startY + 12);

    // Subtext
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(168, 162, 158);
    doc.text(kpi.sub, x + 5, startY + 17);
  });

  // Section 1: Detailed Product Stock & Movement Table
  const tableData = metrics.map((m, index) => {
    const p = m.product;
    return [
      (index + 1).toString(),
      '', // Image thumbnail placeholder rendered via didDrawCell
      `${p.name}\nSKU: ${p.sku}`,
      `${p.category}\n${p.subcategory || 'Standard'}`,
      `Rs. ${p.price.toLocaleString('en-IN')}`,
      `Rs. ${p.salePrice.toLocaleString('en-IN')}`,
      `${p.stock} units\n(Min: ${p.lowStockLimit})`,
      `+${m.totalInward} / -${m.totalOutward}`,
      `Rs. ${m.valuation.toLocaleString('en-IN')}`,
      m.status
    ];
  });

  autoTable(doc, {
    startY: startY + cardHeight + 6,
    head: [[
      '#',
      'Preview',
      'Furniture Title & SKU',
      'Category & Subcategory',
      'MRP',
      'Exclusive Price',
      'Current Stock',
      'Inward / Outward',
      'Asset Valuation',
      'Status'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [28, 25, 23],
      textColor: [245, 158, 11],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [41, 37, 36],
      cellPadding: 2,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 16, halign: 'center' }, // Image column
      2: { cellWidth: 62, fontStyle: 'bold' },
      3: { cellWidth: 38 },
      4: { cellWidth: 20, halign: 'right', textColor: [120, 113, 108] },
      5: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [180, 83, 9] },
      6: { cellWidth: 26, halign: 'center' },
      7: { cellWidth: 26, halign: 'center', textColor: [71, 85, 105] },
      8: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      9: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 249]
    },
    didDrawCell: (data) => {
      // Draw product thumbnail image in Column 1
      if (data.section === 'body' && data.column.index === 1) {
        const prod = metrics[data.row.index]?.product;
        if (prod) {
          const imgBase64 = imageMap.get(prod.id);
          if (imgBase64) {
            try {
              const imgSize = 10;
              const posX = data.cell.x + (data.cell.width - imgSize) / 2;
              const posY = data.cell.y + (data.cell.height - imgSize) / 2;
              doc.addImage(imgBase64, 'JPEG', posX, posY, imgSize, imgSize);
            } catch {
              // Fallback silently
            }
          }
        }
      }

      // Draw color badge for status in Column 9
      if (data.section === 'body' && data.column.index === 9) {
        const status = metrics[data.row.index]?.statusCode;
        if (status === 'OOS') {
          doc.setTextColor(225, 29, 72);
        } else if (status === 'LOW') {
          doc.setTextColor(217, 119, 6);
        } else {
          doc.setTextColor(16, 185, 129);
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 16 }
  });

  // Section 2: Recent Purchasing Inward & Outward Activity Ledger
  doc.addPage();
  const currentTotalPages = doc.getNumberOfPages();
  drawPageHeader(currentTotalPages);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(28, 25, 23);
  doc.text('Purchasing Inward & Outward Transaction Audit Ledger', 14, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  doc.text('Chronological audit record of timber stock arrivals, customer dispatches, and warehouse re-orders.', 14, 37);

  // Combine logs and orders
  const ledgerRows: any[] = logs.slice(0, 30).map((l, i) => [
    (i + 1).toString(),
    l.date || dateStr,
    l.sku,
    l.productName,
    l.type,
    l.quantityChange > 0 ? `+${l.quantityChange} (Inward)` : `${l.quantityChange} (Outward)`,
    `${l.previousStock} -> ${l.newStock}`,
    l.reason
  ]);

  // Append recent orders to ledger
  orders.slice(0, 15).forEach((ord) => {
    ord.items.forEach((item) => {
      const p = products.find((pr) => pr.id === item.productId);
      ledgerRows.push([
        (ledgerRows.length + 1).toString(),
        ord.orderDate || ord.date || dateStr,
        p?.sku || 'CP-FURN',
        item.productName || item.name || 'CP Furniture Item',
        'Order Dispatch',
        `-${item.quantity} (Outward)`,
        `${(p?.stock ?? 0) + item.quantity} -> ${p?.stock ?? 0}`,
        `Order #${ord.orderNumber || ord.id} (${ord.customerName} - ${ord.orderStatus})`
      ]);
    });
  });

  autoTable(doc, {
    startY: 42,
    head: [[
      '#',
      'Date & Timestamp',
      'SKU',
      'Furniture Item Name',
      'Transaction Type',
      'Qty Movement',
      'Stock Delta',
      'Reference & Notes'
    ]],
    body: ledgerRows,
    theme: 'grid',
    headStyles: {
      fillColor: [28, 25, 23],
      textColor: [245, 158, 11],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [41, 37, 36],
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 24, fontStyle: 'bold' },
      3: { cellWidth: 60 },
      4: { cellWidth: 30, halign: 'center' },
      5: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 24, halign: 'center' },
      7: { cellWidth: 65 }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 249]
    },
    margin: { left: 14, right: 14, bottom: 16 }
  });

  // Add Page Footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(p, totalPages);
  }

  // Trigger download
  const fileDate = now.toISOString().split('T')[0];
  doc.save(`CP_Furniture_Master_Inventory_Report_${fileDate}.pdf`);
  if (onProgress) onProgress('');
}
