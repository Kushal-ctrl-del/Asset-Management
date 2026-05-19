import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function downloadPdf(title: string, columns: string[], dataRows: any[][]) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(55, 48, 163); // Indigo
  doc.text('ABC College Student Portal', 14, 22);
  
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(title, 14, 32);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
  
  // Table
  (doc as any).autoTable({
    startY: 45,
    head: [columns],
    body: dataRows,
    theme: 'grid',
    headStyles: { fillColor: [55, 48, 163], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 3 },
  });
  
  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}
