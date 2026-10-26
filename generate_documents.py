import re
import sys
from pathlib import Path
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def generate_docx(md_path, docx_path):
    print("Generating DOCX...")
    doc = docx.Document()

    # Set standard 0.75 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Base styling
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(30, 30, 30)

    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_code_block = False
    code_lines = []
    code_lang = ""
    table_lines = []

    def flush_table(tbl_lines):
        if not tbl_lines:
            return
        rows_data = []
        for line in tbl_lines:
            line = line.strip()
            if not line.startswith('|'):
                continue
            cells = [c.strip() for c in line.split('|')[1:-1]]
            # Skip separator line |---|---|
            if all(set(c).issubset({'-', ':', ' '}) for c in cells):
                continue
            rows_data.append(cells)

        if not rows_data:
            return

        col_count = max(len(r) for r in rows_data)
        # Normalize row lengths
        for r in rows_data:
            while len(r) < col_count:
                r.append("")

        tbl = doc.add_table(rows=len(rows_data), cols=col_count)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = True

        for i, row in enumerate(rows_data):
            for j, cell_text in enumerate(row):
                cell = tbl.cell(i, j)
                cell.text = cell_text
                set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                if i == 0:
                    set_cell_background(cell, "003366")
                    for run in p.runs:
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(255, 255, 255)
                        run.font.size = Pt(9.5)
                else:
                    if i % 2 == 1:
                        set_cell_background(cell, "F8F9FA")
                    for run in p.runs:
                        run.font.size = Pt(9.0)
                        run.font.color.rgb = RGBColor(40, 40, 40)
        doc.add_paragraph()

    i = 0
    while i < len(lines):
        raw_line = lines[i]
        line = raw_line.rstrip()

        # Handle Code Blocks
        if line.startswith('```'):
            if not in_code_block:
                in_code_block = True
                code_lang = line[3:].strip()
                code_lines = []
            else:
                in_code_block = False
                # Add code block as shaded callout table
                block_content = "\n".join(code_lines)
                code_tbl = doc.add_table(rows=1, cols=1)
                code_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = code_tbl.cell(0, 0)
                set_cell_background(cell, "F5F5F7")
                set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
                
                # Add language header if applicable
                p = cell.paragraphs[0]
                if code_lang:
                    run_hdr = p.add_run(f"[{code_lang.upper()}]\n")
                    run_hdr.font.name = 'Consolas'
                    run_hdr.font.size = Pt(8.5)
                    run_hdr.font.bold = True
                    run_hdr.font.color.rgb = RGBColor(0, 113, 227)

                run_code = p.add_run(block_content)
                run_code.font.name = 'Consolas'
                run_code.font.size = Pt(8.5)
                run_code.font.color.rgb = RGBColor(40, 40, 40)
                p.paragraph_format.line_spacing = 1.0
                p.paragraph_format.space_after = Pt(2)
                
                doc.add_paragraph()
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Handle Tables
        if line.startswith('|') and '|' in line[1:]:
            table_lines.append(line)
            i += 1
            continue
        elif table_lines:
            flush_table(table_lines)
            table_lines = []

        # Empty lines
        if not line.strip():
            i += 1
            continue

        # Horizontal rule
        if line.strip() in ['---', '***', '___']:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run("―" * 50)
            run.font.color.rgb = RGBColor(210, 210, 215)
            i += 1
            continue

        # Heading 1
        if line.startswith('# '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(line[2:].strip())
            run.font.name = 'Calibri'
            run.font.size = Pt(20)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0, 51, 102)
            i += 1
            continue

        # Heading 2
        if line.startswith('## '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(line[3:].strip())
            run.font.name = 'Calibri'
            run.font.size = Pt(14)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0, 102, 204)
            i += 1
            continue

        # Heading 3
        if line.startswith('### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(line[4:].strip())
            run.font.name = 'Calibri'
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = RGBColor(40, 40, 40)
            i += 1
            continue

        # Heading 4
        if line.startswith('#### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(line[5:].strip())
            run.font.name = 'Calibri'
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(60, 60, 60)
            i += 1
            continue

        # Bullet list
        if line.strip().startswith(('- ', '* ')):
            bullet_text = line.strip()[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            parse_markdown_formatting(p, bullet_text)
            i += 1
            continue

        # Numbered list
        num_match = re.match(r'^(\d+)\.\s+(.*)', line.strip())
        if num_match:
            num_text = num_match.group(2)
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            parse_markdown_formatting(p, num_text)
            i += 1
            continue

        # Regular paragraph
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        parse_markdown_formatting(p, line)
        i += 1

    if table_lines:
        flush_table(table_lines)

    doc.save(docx_path)
    print(f"Saved DOCX: {docx_path}")

def parse_markdown_formatting(paragraph, text):
    """Parses bold, italic, inline code, and math symbols into Word runs."""
    pattern = re.compile(r'(\*\*.*?\*\*|\*.*?\*|`.*?`|\$\$.*?\$\$|\$.*?\$|\[.*?\]\(.*?\))')
    tokens = pattern.split(text)

    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**') and len(token) >= 4:
            run = paragraph.add_run(token[2:-2])
            run.font.bold = True
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2:
            run = paragraph.add_run(token[1:-1])
            run.font.italic = True
        elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
            run = paragraph.add_run(token[1:-1])
            run.font.name = 'Consolas'
            run.font.size = Pt(9.0)
            run.font.color.rgb = RGBColor(180, 40, 40)
        elif (token.startswith('$$') and token.endswith('$$')) or (token.startswith('$') and token.endswith('$')):
            math_content = token.strip('$')
            run = paragraph.add_run(math_content)
            run.font.name = 'Cambria Math'
            run.font.italic = True
            run.font.color.rgb = RGBColor(0, 80, 160)
        elif token.startswith('[') and '](' in token and token.endswith(')'):
            m = re.match(r'\[(.*?)\]\((.*?)\)', token)
            if m:
                run = paragraph.add_run(m.group(1))
                run.font.color.rgb = RGBColor(0, 102, 204)
                run.font.underline = True
            else:
                paragraph.add_run(token)
        else:
            paragraph.add_run(token)

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6e6e73"))
        
        # Header
        self.setStrokeColor(colors.HexColor("#e5e5ea"))
        self.setLineWidth(0.5)
        self.line(40, 755, 572, 755)
        self.drawString(40, 760, "PARTNERIQ — Architectural Design Document")
        self.drawRightString(572, 760, "CONFIDENTIAL // ARCHITECTURE SPECIFICATION")
        
        # Footer
        self.line(40, 45, 572, 45)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 33, page_str)
        self.drawString(40, 33, "© 2026 PartnerIQ Inc. All rights reserved.")
        self.restoreState()

def generate_pdf(md_path, pdf_path):
    print("Generating PDF...")
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#003366"),
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#004080"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#1d1d1f"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'H3',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#424245"),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor("#1d1d1f"),
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        bulletIndent=5,
        spaceAfter=2
    )

    code_style = ParagraphStyle(
        'Code',
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#222222")
    )

    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    story = []
    in_code_block = False
    code_lines = []
    table_lines = []

    def flush_pdf_table(tbl_lines):
        if not tbl_lines:
            return
        rows_data = []
        for line in tbl_lines:
            line = line.strip()
            if not line.startswith('|'):
                continue
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if all(set(c).issubset({'-', ':', ' '}) for c in cells):
                continue
            rows_data.append(cells)

        if not rows_data:
            return

        col_count = max(len(r) for r in rows_data)
        for r in rows_data:
            while len(r) < col_count:
                r.append("")

        # Wrap in paragraphs for auto-wrap
        table_paragraphs = []
        for row_idx, r in enumerate(rows_data):
            row_p = []
            for c in r:
                clean_c = c.replace('<', '&lt;').replace('>', '&gt;')
                clean_c = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', clean_c)
                clean_c = re.sub(r'`(.*?)`', r'<font face="Courier" color="#b02020">\1</font>', clean_c)
                if row_idx == 0:
                    p = Paragraph(f"<b>{clean_c}</b>", ParagraphStyle('TH', parent=body_style, fontSize=8, leading=10, textColor=colors.white))
                else:
                    p = Paragraph(clean_c, ParagraphStyle('TD', parent=body_style, fontSize=7.5, leading=9.5))
                row_p.append(p)
            table_paragraphs.append(row_p)

        # Available width is 520 pt
        col_w = 520.0 / col_count
        t = Table(table_paragraphs, colWidths=[col_w] * col_count)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#003366")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dcdce0")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
        ]))
        story.append(t)
        story.append(Spacer(1, 6))

    i = 0
    while i < len(lines):
        raw_line = lines[i]
        line = raw_line.rstrip()

        # Handle Code
        if line.startswith('```'):
            if not in_code_block:
                in_code_block = True
                code_lines = []
            else:
                in_code_block = False
                # Chunk code lines into blocks of 20 lines so they paginate cleanly across pages
                CHUNK_SIZE = 22
                for c_idx in range(0, len(code_lines), CHUNK_SIZE):
                    chunk = code_lines[c_idx:c_idx + CHUNK_SIZE]
                    code_text = "\n".join(chunk).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    code_p = Preformatted(code_text, code_style)
                    code_box = Table([[code_p]], colWidths=[520])
                    code_box.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f5f5f7")),
                        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#dcdce0")),
                        ('TOPPADDING', (0, 0), (-1, -1), 4),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                        ('LEFTPADDING', (0, 0), (-1, -1), 6),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                    ]))
                    story.append(code_box)
                    story.append(Spacer(1, 3))
                story.append(Spacer(1, 4))
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Handle Tables
        if line.startswith('|') and '|' in line[1:]:
            table_lines.append(line)
            i += 1
            continue
        elif table_lines:
            flush_pdf_table(table_lines)
            table_lines = []

        if not line.strip():
            i += 1
            continue

        if line.strip() in ['---', '***', '___']:
            sep = Table([[""]], colWidths=[520], rowHeights=[1])
            sep.setStyle(TableStyle([
                ('LINEABOVE', (0, 0), (-1, -1), 0.5, colors.HexColor("#d2d2d7"))
            ]))
            story.append(Spacer(1, 4))
            story.append(sep)
            story.append(Spacer(1, 6))
            i += 1
            continue

        # Clean xml chars
        clean_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        clean_line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', clean_line)
        clean_line = re.sub(r'`(.*?)`', r'<font face="Courier" color="#b02020">\1</font>', clean_line)
        clean_line = re.sub(r'\[(.*?)\]\((.*?)\)', r'<font color="#0066cc"><u>\1</u></font>', clean_line)

        if line.startswith('# '):
            story.append(Paragraph(clean_line[2:], title_style))
        elif line.startswith('## '):
            story.append(Paragraph(clean_line[3:], h1_style))
        elif line.startswith('### '):
            story.append(Paragraph(clean_line[4:], h2_style))
        elif line.startswith('#### '):
            story.append(Paragraph(clean_line[5:], h3_style))
        elif line.strip().startswith(('- ', '* ')):
            story.append(Paragraph(f"&bull; {clean_line.strip()[2:]}", bullet_style))
        elif re.match(r'^\d+\.\s+', line.strip()):
            m = re.match(r'^(\d+)\.\s+(.*)', clean_line.strip())
            story.append(Paragraph(f"<b>{m.group(1)}.</b> {m.group(2)}", bullet_style))
        else:
            story.append(Paragraph(clean_line, body_style))

        i += 1

    if table_lines:
        flush_pdf_table(table_lines)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Saved PDF: {pdf_path}")

if __name__ == '__main__':
    md = Path("PARTNERIQ_Architectural_Design_Document.md")
    if not md.exists():
        print(f"Error: {md} not found!")
        sys.exit(1)

    docx_out = Path("PARTNERIQ_Architectural_Design_Document.docx")
    pdf_out = Path("PARTNERIQ_Architectural_Design_Document.pdf")

    generate_docx(md, docx_out)
    generate_pdf(md, pdf_out)
    print("All documents generated successfully.")
