import { useState } from 'react';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';

const useExportPDF = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = (elementRef, filename = 'estimate.pdf') => {
    if (!elementRef.current) return;

    setIsExporting(true);
    html2pdf()
      .from(elementRef.current)
      .set({
        margin: 0.5,
        filename,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      })
      .save()
      .finally(() => setIsExporting(false));
  };

  return { exportToPDF, isExporting };
};

export default useExportPDF;
