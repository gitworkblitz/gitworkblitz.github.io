import os
import hmac
import hashlib
from datetime import datetime
from ..db.firebase import FirebaseDB
from ..services.invoice_service import InvoiceService

# Try importing razorpay — fallback gracefully if not installed
try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    RAZORPAY_AVAILABLE = False

# Initialize Razorpay Client (Keys loaded from .env)
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "dummy_key_id")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "dummy_key_secret")

razorpay_client = None
if RAZORPAY_AVAILABLE and RAZORPAY_KEY_ID != "dummy_key_id":
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class PaymentService:
    @staticmethod
    async def create_razorpay_order(amount: float, receipt: str, notes: dict = None) -> dict:
        """
        Creates an order in Razorpay.
        Amount should be passed in INR (rupees), it will be converted to paise.
        """
        amount_in_paise = int(amount * 100)
        
        data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": receipt,
            "notes": notes or {}
        }
        
        # In case razorpay keys are missing or package not installed, mock the response
        if not razorpay_client or RAZORPAY_KEY_ID == "dummy_key_id":
            return {
                "id": f"order_dummy_{receipt}",
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": receipt,
                "status": "created"
            }

        try:
            order = razorpay_client.order.create(data=data)
            return order
        except Exception as e:
            print(f"Error creating Razorpay order: {e}")
            raise

    @staticmethod
    async def create_payment_record(booking_id: str, user_id: str, amount: float, order_id: str) -> dict:
        data = {
            "booking_id": booking_id,
            "user_id": user_id,
            "amount": amount,
            "order_id": order_id,
            "status": "created",
            "created_at": datetime.utcnow().isoformat(),
        }
        pay_id = await FirebaseDB.create_document("payments", data)
        data["id"] = pay_id
        return data

    @staticmethod
    def verify_razorpay_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Verifies the signature sent back by Razorpay on successful payment.
        """
        if RAZORPAY_KEY_ID == "dummy_key_id":
            return True  # allow bypass for local dev
            
        try:
            payload = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.HMAC(
                bytes(RAZORPAY_KEY_SECRET, 'utf-8'),
                bytes(payload, 'utf-8'),
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(expected_signature, razorpay_signature)
        except Exception as e:
            print(f"Signature verification failed: {e}")
            return False

    @staticmethod
    async def mark_paid(order_id: str, payment_id: str, booking_id: str) -> bool:
        """
        Simplified payment completion for dev/simulated mode.
        Marks payment as paid, updates booking, and generates invoice.
        """
        try:
            now = datetime.utcnow().isoformat()
            
            # 1. Update payment records for this order
            payments = await FirebaseDB.query_collection("payments", "order_id", "==", order_id)
            for p in payments:
                await FirebaseDB.update_document("payments", p["id"], {
                    "status": "paid",
                    "payment_id": payment_id,
                    "paid_at": now,
                    "updated_at": now,
                })
            
            # 2. Update booking status
            await FirebaseDB.update_document("bookings", booking_id, {
                "payment_status": "paid",
                "paid_at": now,
                "updated_at": now,
            })
            
            # 3. Generate invoice
            await InvoiceService.generate_invoice(booking_id)
            
            return True
        except Exception as e:
            print(f"Error in mark_paid: {e}")
            return False

    @staticmethod
    async def process_payment_success(order_id: str, payment_id: str, signature: str, booking_id: str) -> bool:
        """
        Full workflow to handle a successful payment callback from Razorpay.
        """
        # 1. Verify signature
        if not PaymentService.verify_razorpay_signature(order_id, payment_id, signature):
            raise ValueError("Invalid Razorpay payment signature.")

        # 2. Use mark_paid for the rest
        return await PaymentService.mark_paid(order_id, payment_id, booking_id)

    @staticmethod
    async def get_user_payments(user_id: str) -> list:
        return await FirebaseDB.query_collection("payments", "user_id", "==", user_id)
