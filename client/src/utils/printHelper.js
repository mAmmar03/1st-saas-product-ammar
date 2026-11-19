/**
 * Enterprise Print Helper for Slips & Weekly Sheets
 * Uses an isolated hidden iframe to completely bypass modal centering, transforms,
 * and backdrop blur. Guarantees the document starts at the very top (0,0) of the A4 page
 * with perfect margins and full Tailwind CSS styling.
 */
export function printDocument(elementId, title = 'AmmarDev CRM Document') {
  const content = document.getElementById(elementId);
  if (!content) {
    window.print();
    return;
  }

  // Remove existing print iframe if present
  const existingFrame = document.getElementById('crm-isolated-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  // Create clean isolated iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'crm-isolated-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // Extract all existing CSS link and style tags from current head
  const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #09090b !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          #weekly-pr-print-area,
          #payment-voucher-print-area {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            position: static !important;
            top: 0 !important;
            left: 0 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${content.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Allow styles, SVGs, and base64 images to settle before triggering print dialog
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.warn('Iframe print error, falling back to window.print()', e);
      window.print();
    }
  }, 350);
}
