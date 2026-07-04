/** Print styles inlined so a clean popup window can print without browser URL/date headers from the app page. */
const RECEIPT_PRINT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 12mm;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
  }

  .billing-receipt-document {
    box-sizing: border-box;
    max-width: 210mm;
    margin: 0 auto;
    padding: 0;
    background: #fff;
    color: #111;
    font-family: 'Times New Roman', Times, serif;
    font-size: 11pt;
    line-height: 1.35;
  }

  .billing-receipt-header {
    position: relative;
    text-align: center;
    border-bottom: 2px solid #111;
    padding-bottom: 10px;
    margin-bottom: 12px;
  }

  .billing-receipt-ref {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0;
    font-size: 9pt;
    font-weight: 700;
  }

  .billing-receipt-emblem-wrap {
    display: flex;
    justify-content: center;
    margin: 4px 0 6px;
  }

  .billing-receipt-emblem {
    width: 72px;
    height: auto;
    object-fit: contain;
  }

  .billing-receipt-republic,
  .billing-receipt-ministry,
  .billing-receipt-facility,
  .billing-receipt-title {
    margin: 0;
  }

  .billing-receipt-republic {
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .billing-receipt-ministry {
    margin-top: 2px;
    font-size: 10pt;
    font-weight: 700;
  }

  .billing-receipt-facility {
    margin-top: 6px;
    font-size: 10.5pt;
    font-weight: 700;
    text-transform: uppercase;
  }

  .billing-receipt-facility-sub {
    margin: 2px 0 0;
    font-size: 9.5pt;
  }

  .billing-receipt-title {
    margin-top: 10px;
    font-size: 13pt;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-decoration: underline;
  }

  .billing-receipt-notes {
    border: 1px solid #111;
    padding: 8px 10px;
    margin-bottom: 12px;
    font-size: 9.5pt;
  }

  .billing-receipt-notes__title {
    margin: 0 0 4px;
    font-weight: 700;
  }

  .billing-receipt-notes__list {
    margin: 0;
    padding-left: 18px;
  }

  .billing-receipt-section {
    margin-bottom: 12px;
  }

  .billing-receipt-section__title {
    margin: 0 0 6px;
    font-size: 10.5pt;
    font-weight: 700;
    text-transform: uppercase;
  }

  .billing-receipt-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 14px;
  }

  .billing-receipt-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .billing-receipt-field--wide {
    grid-column: 1 / -1;
  }

  .billing-receipt-field__label {
    font-size: 9pt;
    font-weight: 600;
  }

  .billing-receipt-field__value {
    min-height: 1.35em;
    border-bottom: 1px dotted #333;
    padding-bottom: 1px;
    font-size: 10.5pt;
    font-weight: 700;
  }

  .billing-receipt-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
  }

  .billing-receipt-table th,
  .billing-receipt-table td {
    border: 1px solid #111;
    padding: 5px 6px;
    vertical-align: top;
  }

  .billing-receipt-table th {
    background: #f3f4f6;
    font-weight: 700;
    text-align: left;
  }

  .billing-receipt-table__amount {
    text-align: right;
    white-space: nowrap;
  }

  .billing-receipt-table__total-row td {
    background: #f9fafb;
  }

  .billing-receipt-declaration__text {
    margin: 0 0 10px;
    font-size: 9.5pt;
  }

  .billing-receipt-signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 8px;
  }

  .billing-receipt-signature {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 9pt;
  }

  .billing-receipt-signature__line {
    display: block;
    border-bottom: 1px solid #111;
    min-height: 28px;
  }

  .billing-receipt-signature__name {
    font-weight: 700;
    font-size: 9.5pt;
  }

  .billing-receipt-official {
    margin-top: 14px;
    border-top: 1px solid #111;
    padding-top: 8px;
    font-size: 8.5pt;
  }

  .billing-receipt-official__title {
    margin: 0 0 4px;
    font-weight: 700;
  }
`;

function absolutizeAssetUrls(html) {
  const origin = window.location.origin;
  return html
    .replace(/src="\/([^"]+)"/g, `src="${origin}/$1"`)
    .replace(/href="\/([^"]+)"/g, `href="${origin}/$1"`);
}

/**
 * Opens a minimal print window so the browser does not stamp the app URL / page title on the PDF.
 */
export function printBillingReceipt(receiptElement) {
  if (!receiptElement) return false;

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1200');
  if (!printWindow) return false;

  const content = absolutizeAssetUrls(receiptElement.outerHTML);

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title></title>
    <style>${RECEIPT_PRINT_STYLES}</style>
  </head>
  <body>${content}</body>
</html>`);
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  printWindow.addEventListener('afterprint', () => {
    printWindow.close();
  });

  if (printWindow.document.readyState === 'complete') {
    setTimeout(triggerPrint, 250);
  } else {
    printWindow.addEventListener('load', () => {
      setTimeout(triggerPrint, 250);
    });
  }

  return true;
}
