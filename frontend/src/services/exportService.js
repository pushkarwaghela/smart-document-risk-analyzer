import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

// PDF Export with Charts and Styling
export const exportToPDF = async (document, risks) => {
    try {
        // Create new PDF document
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let yOffset = 20;

        // Title
        doc.setFontSize(24);
        doc.setTextColor(2, 132, 199);
        doc.text('Risk Analysis Report', 20, yOffset);
        yOffset += 15;

        // Document Info
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Document: ${document.title}`, 20, yOffset);
        yOffset += 8;
        doc.text(`Date: ${new Date(document.uploaded_at).toLocaleDateString()}`, 20, yOffset);
        yOffset += 8;
        doc.text(`Status: ${document.status}`, 20, yOffset);
        yOffset += 15;

        // Summary Stats
        doc.setFontSize(16);
        doc.setTextColor(2, 132, 199);
        doc.text('Risk Summary', 20, yOffset);
        yOffset += 10;

        const critical = risks.filter(r => r.risk_level === 'CRITICAL').length;
        const high = risks.filter(r => r.risk_level === 'HIGH').length;
        const medium = risks.filter(r => r.risk_level === 'MEDIUM').length;
        const low = risks.filter(r => r.risk_level === 'LOW').length;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`• Critical Risks: ${critical}`, 25, yOffset);
        yOffset += 7;
        doc.text(`• High Risks: ${high}`, 25, yOffset);
        yOffset += 7;
        doc.text(`• Medium Risks: ${medium}`, 25, yOffset);
        yOffset += 7;
        doc.text(`• Low Risks: ${low}`, 25, yOffset);
        yOffset += 15;

        // Risk Details Table
        doc.setFontSize(16);
        doc.setTextColor(2, 132, 199);
        doc.text('Risk Details', 20, yOffset);
        yOffset += 10;

        const tableColumn = ['Category', 'Risk Level', 'Clause', 'Page'];
        const tableRows = risks.map(risk => [
            risk.category_display || risk.category,
            risk.risk_level,
            risk.clause_text.substring(0, 100) + (risk.clause_text.length > 100 ? '...' : ''),
            risk.page_number || 1
        ]);

        // Use autoTable correctly
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: yOffset,
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { left: 20, right: 20 },
        });

        // Save the PDF
        const filename = `${document.title.replace(/[^a-z0-9]/gi, '_')}_risk_report.pdf`;
        doc.save(filename);

        return true;
    } catch (error) {
        console.error('PDF Export Error:', error);
        throw error;
    }
};

// Export to Excel
export const exportToExcel = (documents, risks = []) => {
    try {
        const wb = XLSX.utils.book_new();

        // Documents sheet
        const docsData = documents.map(doc => ({
            'Title': doc.title,
            'Type': doc.document_type,
            'Status': doc.status,
            'Uploaded': new Date(doc.uploaded_at).toLocaleDateString(),
            'Risk Count': doc.risk_count || 0
        }));

        const docsSheet = XLSX.utils.json_to_sheet(docsData);
        XLSX.utils.book_append_sheet(wb, docsSheet, 'Documents');

        // Risks sheet (if provided)
        if (risks.length > 0) {
            const risksData = risks.map(risk => ({
                'Document': risk.document_title || documents[0]?.title,
                'Category': risk.category_display || risk.category,
                'Risk Level': risk.risk_level,
                'Clause': risk.clause_text,
                'Explanation': risk.explanation,
                'Page': risk.page_number || 1
            }));

            const risksSheet = XLSX.utils.json_to_sheet(risksData);
            XLSX.utils.book_append_sheet(wb, risksSheet, 'Risks');
        }

        XLSX.writeFile(wb, 'risk_analysis_export.xlsx');
    } catch (error) {
        console.error('Excel Export Error:', error);
        throw error;
    }
};

// Export to CSV
export const exportToCSV = (data, filename) => {
    try {
        if (!data || data.length === 0) {
            throw new Error('No data to export');
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row =>
            Object.values(row).map(val =>
                typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            ).join(',')
        );

        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('CSV Export Error:', error);
        throw error;
    }
};

// Export as JSON
export const exportToJSON = (data, filename) => {
    try {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('JSON Export Error:', error);
        throw error;
    }
};