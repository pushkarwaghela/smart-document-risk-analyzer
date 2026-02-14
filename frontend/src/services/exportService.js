import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = async (document, risks) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(24);
    doc.setTextColor(2, 132, 199); // Primary blue
    doc.text('Risk Analysis Report', 20, 20);

    // Document info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Document: ${document.title}`, 20, 40);
    doc.text(`Date: ${new Date(document.uploaded_at).toLocaleDateString()}`, 20, 50);
    doc.text(`Status: ${document.status}`, 20, 60);

    // Summary
    doc.setFontSize(16);
    doc.setTextColor(2, 132, 199);
    doc.text('Executive Summary', 20, 80);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Risks Detected: ${risks.length}`, 20, 100);

    const critical = risks.filter(r => r.risk_level === 'CRITICAL').length;
    const high = risks.filter(r => r.risk_level === 'HIGH').length;
    const medium = risks.filter(r => r.risk_level === 'MEDIUM').length;
    const low = risks.filter(r => r.risk_level === 'LOW').length;

    doc.text(`Critical: ${critical}`, 30, 115);
    doc.text(`High: ${high}`, 30, 125);
    doc.text(`Medium: ${medium}`, 30, 135);
    doc.text(`Low: ${low}`, 30, 145);

    // Risk details table
    const tableColumn = ['Category', 'Risk Level', 'Clause', 'Page'];
    const tableRows = risks.slice(0, 20).map(risk => [
        risk.category_display,
        risk.risk_level,
        risk.clause_text.substring(0, 50) + '...',
        risk.page_number
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 160,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [2, 132, 199] }
    });

    // Save PDF
    doc.save(`${document.title}_risk_report.pdf`);
};

export const exportToExcel = (documents) => {
    const worksheet = XLSX.utils.json_to_sheet(
        documents.map(doc => ({
            'Document Title': doc.title,
            'Type': doc.document_type,
            'Status': doc.status,
            'Uploaded': new Date(doc.uploaded_at).toLocaleDateString(),
            'Risks': doc.risk_count || 0
        }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Documents');

    // Auto-size columns
    const maxWidth = 50;
    const wscols = [
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 }
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, 'documents_export.xlsx');
};