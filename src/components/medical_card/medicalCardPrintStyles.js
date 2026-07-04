/** Print styles for patient medical card (inlined for iframe / PDF output). */
export const MEDICAL_CARD_PRINT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 12mm 10mm;
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    width: 100%;
    overflow: visible;
  }

  .medical-card-document {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    background: #fff;
    color: #111;
    font-family: 'Times New Roman', Times, serif;
    font-size: 10pt;
    line-height: 1.35;
    overflow: visible;
  }

  .medical-card-header {
    position: relative;
    text-align: center;
    border-bottom: 2px solid #111;
    padding-bottom: 8px;
    margin-bottom: 10px;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .medical-card-ref {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0;
    font-size: 8pt;
    font-weight: 700;
  }

  .medical-card-emblem-wrap {
    display: flex;
    justify-content: center;
    margin: 4px 0 6px;
  }

  .medical-card-emblem {
    width: 60px;
    height: auto;
    object-fit: contain;
  }

  .medical-card-republic { margin: 0; font-size: 10.5pt; font-weight: 700; }
  .medical-card-ministry { margin: 2px 0 0; font-size: 9.5pt; font-weight: 700; }
  .medical-card-facility { margin: 5px 0 0; font-size: 9.5pt; font-weight: 700; text-transform: uppercase; }
  .medical-card-facility-sub { margin: 2px 0 0; font-size: 8.5pt; }
  .medical-card-title { margin: 8px 0 0; font-size: 11pt; font-weight: 700; text-decoration: underline; }
  .medical-card-generated { margin: 3px 0 0; font-size: 8pt; }

  .medical-card-notes {
    border: 1px solid #111;
    padding: 6px 8px;
    margin-bottom: 10px;
    font-size: 8.5pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .medical-card-notes__title { margin: 0 0 3px; font-weight: 700; }
  .medical-card-notes__list { margin: 0; padding-left: 16px; }

  .medical-card-section { margin-bottom: 10px; overflow: visible; }
  .medical-card-section__title {
    margin: 0 0 5px;
    font-size: 9.5pt;
    font-weight: 700;
    text-transform: uppercase;
  }

  .medical-card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
  }

  .medical-card-grid--visit { margin-bottom: 8px; }
  .medical-card-field { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .medical-card-field--wide { grid-column: 1 / -1; }
  .medical-card-field__label { font-size: 8pt; font-weight: 600; }
  .medical-card-field__value {
    border-bottom: 1px dotted #333;
    font-size: 9pt;
    font-weight: 700;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .medical-card-visit {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid #ccc;
    break-inside: auto;
    page-break-inside: auto;
    overflow: visible;
  }

  .medical-card-visit + .medical-card-visit {
    break-before: page;
    page-break-before: always;
  }

  .medical-card-visit__title {
    margin: 0 0 6px;
    font-size: 10pt;
    font-weight: 700;
    break-after: avoid;
    page-break-after: avoid;
  }

  .medical-card-subtitle {
    margin: 8px 0 4px;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    break-after: avoid;
    page-break-after: avoid;
  }

  .medical-card-table {
    width: 100%;
    max-width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 7.5pt;
    margin-bottom: 6px;
  }

  .medical-card-table th,
  .medical-card-table td {
    border: 1px solid #111;
    padding: 3px 4px;
    vertical-align: top;
    text-align: left;
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }

  .medical-card-table thead th {
    background: #f3f4f6;
    font-weight: 700;
    font-size: 7pt;
  }

  .medical-card-table--pathway th:nth-child(1),
  .medical-card-table--pathway td:nth-child(1) { width: 16%; }
  .medical-card-table--pathway th:nth-child(2),
  .medical-card-table--pathway td:nth-child(2) { width: 17%; }
  .medical-card-table--pathway th:nth-child(3),
  .medical-card-table--pathway td:nth-child(3) { width: 17%; }
  .medical-card-table--pathway th:nth-child(4),
  .medical-card-table--pathway td:nth-child(4) { width: 17%; }
  .medical-card-table--pathway th:nth-child(5),
  .medical-card-table--pathway td:nth-child(5) { width: 33%; }

  .medical-card-table--nested th { width: 34%; background: #f9fafb; font-weight: 600; }
  .medical-card-table__amount { text-align: right; white-space: nowrap; }

  .medical-card-clinical-block {
    margin: 6px 0;
    padding: 5px 6px;
    border: 1px solid #ddd;
    background: #fafafa;
    break-inside: auto;
    page-break-inside: auto;
  }

  .medical-card-clinical-block__title {
    margin: 0 0 3px;
    font-size: 8.5pt;
    font-weight: 700;
  }

  .medical-card-clinical-text {
    margin: 0 0 4px;
    font-size: 8.5pt;
    word-break: break-word;
  }

  .medical-card-muted {
    margin: 0;
    font-size: 8.5pt;
    font-style: italic;
  }

  .medical-card-official {
    margin-top: 12px;
    border-top: 1px solid #111;
    padding-top: 6px;
    font-size: 7.5pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .medical-card-official__title { margin: 0 0 3px; font-weight: 700; }
`;
