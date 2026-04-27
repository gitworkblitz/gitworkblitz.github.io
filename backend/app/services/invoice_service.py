import os
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from ..db.firebase import FirebaseDB
from ..utils.helpers import generate_invoice_number, calculate_gst

class InvoiceService:
    @staticmethod
    def _create_pdf(invoice_data: dict, filepath: str):
        """Generates a professional PDF invoice using ReportLab."""
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Custom Styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#4F46E5'),
            spaceAfter=20
        )
        normal_style = styles['Normal']
        
        # Header
        elements.append(Paragraph("<b>WorkSphere</b>", title_style))
        elements.append(Paragraph("TAX INVOICE", styles['Heading3']))
        elements.append(Spacer(1, 12))

        # Invoice Info & Customer Details
        customer_name = invoice_data['customer_details']['name']
        customer_address = invoice_data['customer_details']['address']
        invoice_num = invoice_data['invoice_number']
        date_str = invoice_data['created_at'][:10]
        
        info_text = f"""
        <b>Invoice Number:</b> {invoice_num}<br/>
        <b>Date:</b> {date_str}<br/>
        <b>Payment Status:</b> PAID<br/><br/>
        <b>Bill To:</b><br/>
        {customer_name}<br/>
        {customer_address}
        """
        elements.append(Paragraph(info_text, normal_style))
        elements.append(Spacer(1, 24))

        # Service Details
        service_title = invoice_data['service_details']['title']
        service_date = invoice_data['service_details']['date']
        
        amounts = invoice_data['amount']
        subtotal = f"Rs. {amounts['subtotal']:.2f}"
        tax = f"Rs. {amounts['tax']:.2f}"
        total = f"Rs. {amounts['total']:.2f}"

        data = [
            ["Description", "Service Date", "Amount"],
            [service_title, service_date, subtotal],
            ["", "Subtotal", subtotal],
            ["", "GST (18%)", tax],
            ["", "Total", total],
        ]

        # Create Table
        t = Table(data, colWidths=[250, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F3F4F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (1, -1), (-1, -1), colors.HexColor('#E5E7EB')),
            ('FONTNAME', (1, -1), (-1, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB'))
        ]))
        
        elements.append(t)
        elements.append(Spacer(1, 48))
        
        # Footer
        elements.append(Paragraph("Thank you for using WorkSphere!", styles['Italic']))
        elements.append(Paragraph("This is a computer-generated invoice and does not require a signature.", normal_style))
        
        doc.build(elements)

    @staticmethod
    async def generate_invoice(booking_id: str) -> dict:
        try:
            # Check if invoice already exists to prevent duplicates
            existing_invoices = await FirebaseDB.query_collection("invoices", "booking_id", "==", booking_id)
            if existing_invoices:
                print(f"Invoice already exists for booking {booking_id}")
                return existing_invoices[0]

            booking = await FirebaseDB.get_document("bookings", booking_id)
            if not booking:
                print(f"Booking {booking_id} not found.")
                return None

            amounts = calculate_gst(booking.get("amount", 0))
            inv_num = generate_invoice_number()

            invoice_data = {
                "invoice_number": inv_num,
                "booking_id": booking_id,
                "user_id": booking.get("customer_id", ""),
                "worker_id": booking.get("worker_id", ""),
                "customer_details": {
                    "name": booking.get("customer_name", "Customer"),
                    "address": booking.get("address", "N/A"),
                },
                "worker_details": {
                    "name": booking.get("worker_name", "Worker"),
                },
                "service_details": {
                    "title": booking.get("service_title", "Service"),
                    "date": booking.get("booking_date", ""),
                    "time_slot": booking.get("time_slot", ""),
                },
                "amount": amounts,
                "status": "paid",
                "payment_method": booking.get("payment_method", "card"),
                "transaction_id": booking.get("transaction_id", f"TXN{booking_id[:8]}"),
                "created_at": datetime.utcnow().isoformat(),
            }
            
            # Generate PDF locally
            temp_dir = "/tmp" if os.path.exists("/tmp") else os.getcwd()
            temp_filename = f"{temp_dir}/invoice_{inv_num}_{uuid.uuid4().hex}.pdf"
            
            InvoiceService._create_pdf(invoice_data, temp_filename)
            
            # Upload to Firebase Storage
            user_id = invoice_data["user_id"]
            destination_blob = f"invoices/{user_id}/{inv_num}.pdf"
            
            pdf_url = await FirebaseDB.upload_pdf(temp_filename, destination_blob)
            
            if pdf_url:
                invoice_data["pdf_url"] = pdf_url
            
            # Clean up temp file
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
                
            # Save metadata to Firestore
            inv_id = await FirebaseDB.create_document("invoices", invoice_data)
            invoice_data["id"] = inv_id
            
            print(f"Generated invoice {inv_id} with PDF: {pdf_url}")
            return invoice_data
            
        except Exception as e:
            print(f"Error generating invoice: {e}")
            return None

    @staticmethod
    async def get_user_invoices(user_id: str) -> list:
        try:
            invoices = await FirebaseDB.query_collection("invoices", "user_id", "==", user_id)
            # Sort by created_at desc manually here if needed or let frontend do it
            return sorted(invoices, key=lambda x: x.get('created_at', ''), reverse=True)
        except Exception as e:
            print(f"Error getting user invoices: {e}")
            return []
