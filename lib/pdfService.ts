import jsPDF from 'jspdf';

interface PdfPayload {
  name: string;
  selectedStyle: string;
  estimateLow: number;
  estimateHigh: number;
  beforeImage: string;
  afterImage: string;
  choices: { category: string; product: string }[];
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

  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('renisol', margin, 30);
  doc.setFontSize(8);
  doc.text('BOUWGROEP', margin, 38);

  doc.setFontSize(9);
  doc.setTextColor(244, 116, 59);
  doc.text('INDICATIEF VOORSTEL', pageWidth - margin, 30, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  const dateStr = new Date().toLocaleDateString('nl-BE');
  doc.text(dateStr, pageWidth - margin, 38, { align: 'right' });

  let y = 62;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Beste ${payload.name},`, margin, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Hieronder vindt u een samenvatting van uw persoonlijke badkamervoorstel.', margin, y);
  y += 12;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('GESELECTEERDE STIJL', margin + 6, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(payload.selectedStyle, margin + 6, y + 20);
  y += 36;

  doc.setFillColor(244, 116, 59);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('VERWACHTE INVESTERINGSBANDBREEDTE', margin + 6, y + 10);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const low = payload.estimateLow.toLocaleString('nl-BE');
  const high = payload.estimateHigh.toLocaleString('nl-BE');
  doc.text(`EUR ${low} - EUR ${high}`, margin + 6, y + 24);
  y += 42;

  if (payload.choices.length > 0) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('UW KEUZES', margin, y);
    y += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    payload.choices.forEach((c) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${c.category}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(c.product, margin + 30, y);
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
    doc.text('VISUALISATIE', margin, y);
    y += 4;
    doc.addImage(afterData, 'JPEG', margin, y, imgWidth, imgHeight);

    doc.setFontSize(6);
    doc.setTextColor(200, 200, 200);
    doc.text('RENISOL BOUWGROEP - INDICATIEF', margin + imgWidth / 2, y + imgHeight - 4, { align: 'center' });
    y += imgHeight + 8;
  } catch {
    // skip image if it fails
  }

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
    'DISCLAIMER: Dit document is een indicatief voorstel en vormt geen bindende offerte.',
    'Alle visualisaties zijn AI-generaties en dienen puur ter inspiratie. Afmetingen en productdetails kunnen in de realiteit afwijken.',
    'Prijzen zijn indicatief en gebaseerd op gemiddelde markttarieven. Een definitieve opname en offerte volgt na persoonlijk adviesgesprek.',
    'Definitieve productkeuze gebeurt steeds samen met een Renisol-verkoper. Exacte merken, types en afmetingen zijn niet gegarandeerd.',
    `(C) ${new Date().getFullYear()} Renisol Bouwgroep Systems BV. Alle rechten voorbehouden.`,
  ];
  disclaimerLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 4;
  });

  doc.save(`Renisol_Voorstel_${payload.name.replace(/\s+/g, '_')}.pdf`);
}
