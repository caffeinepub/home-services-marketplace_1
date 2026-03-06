import type { Booking, BrandingConfig, Service } from "../backend.d";

const timeSlotLabel: Record<string, string> = {
  morning: "Morning (9 AM – 12 PM)",
  afternoon: "Afternoon (12 PM – 5 PM)",
  evening: "Evening (5 PM – 9 PM)",
};

function formatIndianCurrency(amount: bigint): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatInvoiceDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function generateInvoice(
  booking: Booking,
  service: Service,
  branding: BrandingConfig | null,
  customerMobile?: string,
  technicianName?: string,
): void {
  const siteName = branding?.siteName ?? "Lepzo";
  const tagline = branding?.tagline ?? "Expert Computer Sales & Services";
  const footerText = branding?.footerText ?? "Built with love by Hemanth";
  const logoDataUrl = branding?.logoDataUrl;
  const primaryColor = "#4f46e5"; // Lepzo indigo accent

  const invoiceNumber = `INV-${booking.id.toString().padStart(5, "0")}`;
  const issuedDate = formatInvoiceDate(booking.date);
  const timeSlot = timeSlotLabel[booking.timeSlot] ?? booking.timeSlot;
  const serviceAmount = formatIndianCurrency(service.maxPrice);

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="${siteName} Logo" style="height: 48px; width: auto; object-fit: contain;" />`
    : `<div style="width: 48px; height: 48px; background: ${primaryColor}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: white; letter-spacing: -1px; font-family: 'Segoe UI', sans-serif;">L</div>`;

  const techRow = technicianName
    ? `<tr><td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Assigned Technician</td><td style="padding: 10px 0; font-weight: 600; color: #0f172a; font-size: 13px; border-bottom: 1px solid #f1f5f9; text-align: right;">${technicianName}</td></tr>`
    : "";

  const customerRow = customerMobile
    ? `<tr><td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Customer Mobile</td><td style="padding: 10px 0; font-weight: 600; color: #0f172a; font-size: 13px; border-bottom: 1px solid #f1f5f9; text-align: right;">${customerMobile}</td></tr>`
    : "";

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNumber} — ${siteName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      max-width: 680px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .header {
      padding: 36px 40px 28px;
      background: linear-gradient(135deg, ${primaryColor} 0%, #6366f1 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-text h1 {
      font-size: 24px;
      font-weight: 800;
      color: white;
      letter-spacing: -0.5px;
    }
    .brand-text p {
      font-size: 13px;
      color: rgba(255,255,255,0.75);
      margin-top: 2px;
    }
    .invoice-label {
      text-align: right;
    }
    .invoice-label h2 {
      font-size: 28px;
      font-weight: 800;
      color: white;
      letter-spacing: -0.5px;
    }
    .invoice-label p {
      font-size: 13px;
      color: rgba(255,255,255,0.75);
      margin-top: 3px;
    }
    .meta-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 40px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .meta-item span:first-child {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .meta-item span:last-child {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .paid-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #dcfce7;
      color: #15803d;
      font-size: 12px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 100px;
      letter-spacing: 0.04em;
      border: 1.5px solid #86efac;
    }
    .paid-badge::before {
      content: '✓';
      font-weight: 900;
    }
    .content {
      padding: 32px 40px;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f1f5f9;
    }
    .detail-table {
      width: 100%;
      border-collapse: collapse;
    }
    .detail-table td {
      padding: 10px 0;
      vertical-align: top;
    }
    .detail-table tr td:first-child {
      color: #64748b;
      font-size: 13px;
      width: 45%;
      border-bottom: 1px solid #f1f5f9;
    }
    .detail-table tr td:last-child {
      font-weight: 600;
      color: #0f172a;
      font-size: 13px;
      text-align: right;
      border-bottom: 1px solid #f1f5f9;
    }
    .detail-table tr:last-child td {
      border-bottom: none;
    }
    .amount-section {
      background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1.5px solid #c7d2fe;
      margin-bottom: 28px;
    }
    .amount-label {
      font-size: 14px;
      font-weight: 600;
      color: #4338ca;
    }
    .amount-label p {
      font-size: 11px;
      font-weight: 500;
      color: #6366f1;
      margin-top: 3px;
    }
    .amount-value {
      font-size: 32px;
      font-weight: 900;
      color: #3730a3;
      letter-spacing: -1px;
    }
    .footer {
      padding: 20px 40px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-text {
      font-size: 12px;
      color: #64748b;
    }
    .footer-powered {
      font-size: 11px;
      color: #94a3b8;
    }
    .footer-powered a {
      color: ${primaryColor};
      text-decoration: none;
      font-weight: 600;
    }
    .address-text {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      max-width: 240px;
      word-break: break-word;
      text-align: right;
      line-height: 1.5;
    }
    @media print {
      body { background: white; }
      .page {
        margin: 0;
        border-radius: 0;
        box-shadow: none;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        ${logoHtml}
        <div class="brand-text">
          <h1>${siteName}</h1>
          <p>${tagline}</p>
        </div>
      </div>
      <div class="invoice-label">
        <h2>INVOICE</h2>
        <p>${invoiceNumber}</p>
      </div>
    </div>

    <!-- Meta bar -->
    <div class="meta-bar">
      <div class="meta-item">
        <span>Date Issued</span>
        <span>${issuedDate}</span>
      </div>
      <div class="meta-item">
        <span>Time Slot</span>
        <span>${timeSlot}</span>
      </div>
      <div class="meta-item">
        <span>Status</span>
        <span><span class="paid-badge">PAID</span></span>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Customer Section -->
      <div class="section">
        <div class="section-title">Customer Details</div>
        <table class="detail-table">
          ${customerRow}
          <tr>
            <td>Booking Reference</td>
            <td>${invoiceNumber}</td>
          </tr>
          <tr>
            <td>Address</td>
            <td><div class="address-text">${booking.address}</div></td>
          </tr>
        </table>
      </div>

      <!-- Service Section -->
      <div class="section">
        <div class="section-title">Service Details</div>
        <table class="detail-table">
          <tr>
            <td>Service</td>
            <td>${service.name}</td>
          </tr>
          <tr>
            <td>Description</td>
            <td style="max-width: 240px; word-break: break-word; text-align: right; line-height: 1.5;">${service.description}</td>
          </tr>
          <tr>
            <td>Service Date</td>
            <td>${issuedDate}</td>
          </tr>
          <tr>
            <td>Time Slot</td>
            <td>${timeSlot}</td>
          </tr>
          ${techRow}
        </table>
      </div>

      <!-- Amount -->
      <div class="amount-section">
        <div class="amount-label">
          Total Amount
          <p>Inclusive of all taxes</p>
        </div>
        <div class="amount-value">${serviceAmount}</div>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: -12px;">
        Thank you for choosing ${siteName}! We appreciate your business.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">${footerText}</div>
      <div class="footer-powered">
        Powered by <a href="https://caffeine.ai" target="_blank">caffeine.ai</a>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow popups for this site to download invoices.");
    return;
  }

  win.document.write(htmlContent);
  win.document.close();
}
