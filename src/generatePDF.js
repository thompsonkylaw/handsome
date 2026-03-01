import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 8;
const SECTION_GAP_MM = 2;

async function renderNodeToPng(node, pixelRatio) {
  try {
    return await toPng(node, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: '#ffffff',
      skipFonts: true,
      fontEmbedCSS: '',
    });
  } catch {
    return await toPng(node, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: '#ffffff',
      skipFonts: true,
      fontEmbedCSS: '',
      filter: (target) => target?.tagName !== 'IFRAME',
    });
  }
}

/**
 * Generate a PDF from a DOM node (the hidden PDFReportContent).
 * @param {Object} options
 * @param {HTMLElement} options.resultNode - The DOM node to capture (PDFReportContent ref)
 * @param {string}      options.fileName  - Base file name for the PDF
 */
export async function generateAssessmentPDF({ resultNode, fileName = 'Assessment' }) {
  if (!resultNode) {
    throw new Error('Result content not found for PDF export.');
  }

  const reportNode = resultNode.firstElementChild || resultNode;
  if (!reportNode) {
    throw new Error('PDF report content is empty.');
  }

  const captureHost = document.createElement('div');
  const captureNode = reportNode.cloneNode(true);

  captureHost.style.position = 'fixed';
  captureHost.style.left = '-100000px';
  captureHost.style.top = '-100000px';
  captureHost.style.width = '1px';
  captureHost.style.height = '1px';
  captureHost.style.overflow = 'visible';
  captureHost.style.opacity = '1';
  captureHost.style.pointerEvents = 'none';
  captureHost.style.zIndex = '2147483647';
  captureHost.style.background = 'transparent';
  captureHost.style.visibility = 'visible';

  captureNode.style.position = 'relative';
  captureNode.style.left = '0';
  captureNode.style.top = '0';
  captureNode.style.opacity = '1';
  captureNode.style.transform = 'none';
  captureNode.style.pointerEvents = 'none';
  captureNode.style.zIndex = '1';
  captureNode.style.width = `${Math.max(reportNode.scrollWidth || 0, reportNode.offsetWidth || 0, 680)}px`;
  captureNode.style.backgroundColor = '#ffffff';

  captureHost.appendChild(captureNode);
  document.body.appendChild(captureHost);

  try {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const pixelRatio = Math.max(2, window.devicePixelRatio || 1);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const contentWidthMm = A4_WIDTH_MM - PAGE_MARGIN_MM * 2;
    const contentHeightMm = A4_HEIGHT_MM - PAGE_MARGIN_MM * 2;

    const sectionNodes = Array.from(captureNode.querySelectorAll('[data-pdf-section]'));
    const nodesToRender = sectionNodes.length > 0 ? sectionNodes : [captureNode];

    let cursorY = PAGE_MARGIN_MM;

    for (let index = 0; index < nodesToRender.length; index += 1) {
      const sectionNode = nodesToRender[index];
      const sourceWidthPx = Math.max(sectionNode.scrollWidth, sectionNode.offsetWidth, 1);
      const sourceHeightPx = Math.max(sectionNode.scrollHeight, sectionNode.offsetHeight, 1);

      if (sourceWidthPx <= 1 || sourceHeightPx <= 1) {
        continue;
      }

      const imageDataUrl = await renderNodeToPng(sectionNode, pixelRatio);
      const sectionHeightMm = contentWidthMm * (sourceHeightPx / sourceWidthPx);

      if (sectionHeightMm <= contentHeightMm) {
        if (cursorY + sectionHeightMm > PAGE_MARGIN_MM + contentHeightMm + 0.01) {
          pdf.addPage();
          cursorY = PAGE_MARGIN_MM;
        }

        pdf.addImage(imageDataUrl, 'PNG', PAGE_MARGIN_MM, cursorY, contentWidthMm, sectionHeightMm, undefined, 'FAST');
        cursorY += sectionHeightMm + SECTION_GAP_MM;
        continue;
      }

      if (cursorY > PAGE_MARGIN_MM + 0.01) {
        pdf.addPage();
        cursorY = PAGE_MARGIN_MM;
      }

      let remainingHeightMm = sectionHeightMm;
      let consumedHeightMm = 0;

      while (remainingHeightMm > 0.01) {
        const availableHeightMm = PAGE_MARGIN_MM + contentHeightMm - cursorY;
        if (availableHeightMm <= 0.01) {
          pdf.addPage();
          cursorY = PAGE_MARGIN_MM;
          continue;
        }

        const drawnHeightMm = Math.min(remainingHeightMm, availableHeightMm);
        const drawY = cursorY - consumedHeightMm;

        pdf.addImage(imageDataUrl, 'PNG', PAGE_MARGIN_MM, drawY, contentWidthMm, sectionHeightMm, undefined, 'FAST');

        remainingHeightMm -= drawnHeightMm;
        consumedHeightMm += drawnHeightMm;

        if (remainingHeightMm > 0.01) {
          pdf.addPage();
          cursorY = PAGE_MARGIN_MM;
        } else {
          cursorY += drawnHeightMm + SECTION_GAP_MM;
        }
      }
    }

    pdf.save(`OALA_2526_Report_${fileName}.pdf`);
  } finally {
    captureHost.remove();
  }
}
