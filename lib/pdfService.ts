import jsPDF from 'jspdf';

const CATEGORY_LABELS: Record<string, string> = {
  WallTile: 'Wall tiles',
  FloorTile: 'Floor tiles',
  Tile: 'Tiles',
};

interface PdfPayload {
  name: string;
  selectedStyle: string;
  styleSummary?: string;
  estimateLow: number;
  estimateHigh: number;
  currency?: string;
  beforeImage: string;
  afterImage: string;
  choices: {
    category: string;
    product: string;
    priceTier?: string;
    priceLow?: number;
    priceHigh?: number;
  }[];
  roomArea?: number;
  roomWidth?: number;
  roomLength?: number;
}

async function loadImageAsDataUrl(src: string): Promise<string> {
  if (src.startsWith('data:')) return src;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateResultPdf(payload: PdfPayload): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // US market: always English
  const symbol = '$';
  const locale = 'en-US';
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Bathroom Tiles', margin, 28);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('VISUALIZE YOUR SPACE', margin, 36);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('AI PROJECT DOSSIER', pageWidth - margin, 28, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text(new Date().toLocaleDateString(locale), pageWidth - margin, 36, { align: 'right' });

  let y = 62;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Hi ${payload.name},`, margin, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Below is a summary of your personal bathroom tile proposal.', margin, y);
  y += 12;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('SELECTED STYLE', margin + 6, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(payload.selectedStyle, margin + 6, y + 20);
  y += 30;

  if (payload.styleSummary) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const summaryLines = doc.splitTextToSize(payload.styleSummary, contentWidth - 12);
    doc.text(summaryLines.slice(0, 3), margin + 6, y);
    y += summaryLines.slice(0, 3).length * 5 + 6;
  }

  if (payload.roomArea || payload.roomWidth) {
    doc.setFillColor(240, 248, 240);
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('ROOM', margin + 6, y + 8);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    const dims = `${payload.roomWidth || '?'} × ${payload.roomLength || '?'} ft = ${payload.roomArea?.toFixed(1) || '?'} sq ft`;
    doc.text(dims, margin + 6, y + 16);
    y += 26;
  }

  doc.setFillColor(12, 45, 72);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('EXPECTED INVESTMENT RANGE', margin + 6, y + 10);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const low = payload.estimateLow.toLocaleString(locale);
  const high = payload.estimateHigh.toLocaleString(locale);
  doc.text(`${symbol}${low} - ${symbol}${high}`, margin + 6, y + 24);
  y += 42;

  if (payload.choices.length > 0) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('YOUR PRODUCT CHOICES', margin, y);
    y += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    payload.choices.forEach((c) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${CATEGORY_LABELS[c.category] || c.category}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      let productText = c.product;
      if (c.priceTier) {
        const tierLabel = c.priceTier === 'premium' ? 'Premium' : c.priceTier === 'mid' ? 'Mid' : 'Budget';
        productText += ` (${tierLabel})`;
      }
      doc.text(productText, margin + 35, y);
      if (c.priceLow && c.priceHigh) {
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `${symbol}${Math.round(c.priceLow).toLocaleString(locale)} - ${Math.round(c.priceHigh).toLocaleString(locale)}`,
          margin + 35, y + 4
        );
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        y += 4;
      }
      y += 6;
    });
    y += 6;
  }

  try {
    const afterData = await loadImageAsDataUrl(payload.afterImage);
    const imgWidth = contentWidth;
    const imgHeight = imgWidth * 0.6;
    if (y + imgHeight > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('AI VISUALIZATION', margin, y);
    y += 4;
    doc.addImage(afterData, 'JPEG', margin, y, imgWidth, imgHeight);

    doc.setFontSize(6);
    doc.setTextColor(200, 200, 200);
    doc.text('BATHROOM TILES - AI GENERATED - INDICATIVE', margin + imgWidth / 2, y + imgHeight - 4, { align: 'center' });
    y += imgHeight + 8;
  } catch {
    // skip image if it fails
  }

  try {
    const beforeData = await loadImageAsDataUrl(payload.beforeImage);
    const imgWidth = contentWidth * 0.5;
    const imgHeight = imgWidth * 0.6;
    if (y + imgHeight > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('CURRENT SITUATION', margin, y);
    y += 4;
    doc.addImage(beforeData, 'JPEG', margin, y, imgWidth, imgHeight);
    y += imgHeight + 8;
  } catch {
    // skip if fails
  }

  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('INCLUDED IN THIS ESTIMATE', margin, y);
  y += 7;
  const inclusions = ['Tiles & materials', 'Professional installation', 'Delivery & transport', 'Demo & disposal'];
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  inclusions.forEach(item => {
    doc.setFont('helvetica', 'normal');
    doc.text(`  \u2022  ${item}`, margin, y);
    y += 5;
  });
  y += 6;

  doc.setFillColor(245, 250, 245);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('NEXT STEPS', margin + 6, y + 8);
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Our experts will contact you within 24 hours.', margin + 6, y + 16);
  doc.text('2. Free on-site survey for a definitive quote.', margin + 6, y + 22);
  y += 38;

  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  const disclaimerLines = [
    'DISCLAIMER: This document is an indicative proposal and does not constitute a binding quote.',
    'All visualizations are AI-generated and for inspiration only. Dimensions and product details may differ in reality.',
    'Prices are indicative and based on average US market rates (2026). A definitive survey and quote follow after consultation.',
    'Final product selection is made with a Bathroom Tiles advisor. Exact brands, types and dimensions are not guaranteed.',
    `(C) ${new Date().getFullYear()} bathroom-tiles.com. All rights reserved.`,
  ];
  disclaimerLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 4;
  });

  doc.save(`BathroomTiles_Dossier_${payload.name.replace(/\s+/g, '_')}.pdf`);
}
