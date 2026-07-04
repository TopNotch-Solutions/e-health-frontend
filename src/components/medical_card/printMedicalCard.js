import { MEDICAL_CARD_PRINT_STYLES } from './medicalCardPrintStyles';

function absolutizeAssetUrls(html) {
  const origin = window.location.origin;
  return html
    .replace(/src="\/([^"]+)"/g, `src="${origin}/$1"`)
    .replace(/href="\/([^"]+)"/g, `href="${origin}/$1"`);
}

function waitForImages(doc) {
  const images = [...doc.images];
  if (!images.length) return Promise.resolve();
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        })
    )
  );
}

function buildPrintHtml(content) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title> </title>
    <style>${MEDICAL_CARD_PRINT_STYLES}</style>
  </head>
  <body>${content}</body>
</html>`;
}

/**
 * Open a clean about:blank window so the print footer does not show the app URL
 * (e.g. localhost:3000/system_admin).
 */
export async function printMedicalCard(cardElement) {
  if (!cardElement) return false;

  const printWindow = window.open('about:blank', '_blank');
  if (!printWindow) return false;

  const content = absolutizeAssetUrls(cardElement.outerHTML);
  const doc = printWindow.document;

  doc.open();
  doc.write(buildPrintHtml(content));
  doc.close();

  try {
    await waitForImages(doc);
    await new Promise((resolve) => setTimeout(resolve, 500));
    printWindow.focus();
    printWindow.print();
    return true;
  } catch {
    printWindow.close();
    return false;
  }
}

export function medicalCardFilename(card) {
  const number = (card?.patient?.patient_number || 'patient').replace(/[^\w-]+/g, '_');
  const scope = card?.scope === 'visit' ? 'consultation' : 'full-history';
  return `medical-card-${number}-${scope}.pdf`;
}
