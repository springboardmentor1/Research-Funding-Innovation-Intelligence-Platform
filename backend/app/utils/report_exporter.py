import io
import pandas as pd
import logging

def generate_pdf_report(title: str, headers: list, rows: list) -> bytes:
    """Generates a styled PDF report in memory using ReportLab."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter, 
            rightMargin=36, 
            leftMargin=36, 
            topMargin=36, 
            bottomMargin=36
        )
        styles = getSampleStyleSheet()
        
        story = []
        
        # Doc Header
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#0e1828'),
            spaceAfter=6
        )
        story.append(Paragraph(title, title_style))
        story.append(Paragraph("AI-Powered Research Funding & Innovation Intelligence Platform", styles['SubTitle']))
        story.append(Spacer(1, 14))
        
        # Format table contents into Paragraphs
        header_style = ParagraphStyle('HStyle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=colors.white)
        body_style = ParagraphStyle('BStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#090f19'))
        
        formatted_table = []
        # Headers
        formatted_table.append([Paragraph(str(h), header_style) for h in headers])
        
        # Rows
        for r in rows:
            formatted_table.append([Paragraph(str(cell), body_style) for cell in r])
            
        t = Table(formatted_table, colWidths=[90, 240, 100, 110])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#24527a')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('TOPPADDING', (0, 0), (-1, 0), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F1F5F9')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ]))
        story.append(t)
        
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    except Exception as e:
        logging.error(f"ReportLab PDF generation error: {e}")
        # Plaintext / Markdown PDF fallback buffer
        text_content = f"{title}\nAI-Powered Research Funding Platform\n\n"
        text_content += "\t".join(headers) + "\n"
        for r in rows:
            text_content += "\t".join([str(c) for c in r]) + "\n"
        return text_content.encode('utf-8')

def generate_excel_report(headers: list, rows: list) -> bytes:
    """Generates an Excel spreadsheet in memory using Pandas / OpenPyXL."""
    df = pd.DataFrame(rows, columns=headers)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Intelligence Report')
    excel_bytes = buffer.getvalue()
    buffer.close()
    return excel_bytes
