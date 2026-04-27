from datetime import datetime
from typing import List
from ..db.firebase import FirebaseDB

FIXED_TIME_SLOTS = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
]

# Strict state machine for booking lifecycle
VALID_TRANSITIONS = {
    "requested": ["accepted", "cancelled"],
    "accepted": ["on_the_way", "cancelled"],
    "on_the_way": ["completed"],
    "completed": [],   # terminal state
    "cancelled": [],   # terminal state
}

# Which roles can perform which transitions
ROLE_PERMISSIONS = {
    "accepted": "worker",      # only worker can accept
    "on_the_way": "worker",    # only worker can mark on_the_way
    "completed": "worker",     # only worker can mark completed
    "cancelled": "any",        # both customer and worker can cancel
}


class BookingService:
    @staticmethod
    def generate_time_slots() -> List[str]:
        return FIXED_TIME_SLOTS

    @staticmethod
    async def get_booked_slots(worker_id: str, date: str) -> List[str]:
        bookings = await FirebaseDB.query_multiple("bookings", [
            ("worker_id", "==", worker_id),
            ("booking_date", "==", date),
        ])
        return [b.get("time_slot") for b in bookings
                if b.get("status") in ("requested", "accepted", "on_the_way")]

    @staticmethod
    async def create_booking(data: dict) -> dict:
        now = datetime.utcnow().isoformat()
        data["created_at"] = now
        data["updated_at"] = now
        data["status"] = "requested"
        data["payment_status"] = "pending"

        # Double-booking prevention
        if data.get("worker_id") and data.get("booking_date") and data.get("time_slot"):
            booked = await BookingService.get_booked_slots(
                data["worker_id"], data["booking_date"]
            )
            if data["time_slot"] in booked:
                raise ValueError(
                    f"Worker is already booked for {data['booking_date']} at {data['time_slot']}"
                )

        booking_id = await FirebaseDB.create_document("bookings", data)
        data["id"] = booking_id
        return data

    @staticmethod
    async def update_status(booking_id: str, new_status: str, user_id: str = None) -> bool:
        """
        Enforce strict state machine transitions.
        Optionally validates that the requesting user has the right role.
        """
        # Validate new_status is a known status
        all_statuses = set(VALID_TRANSITIONS.keys())
        if new_status not in all_statuses:
            raise ValueError(f"Unknown status: {new_status}")

        # Fetch current booking
        booking = await FirebaseDB.get_document("bookings", booking_id)
        if not booking:
            raise ValueError(f"Booking {booking_id} not found")

        current_status = booking.get("status", "requested")

        # Validate transition
        allowed = VALID_TRANSITIONS.get(current_status, [])
        if new_status not in allowed:
            raise ValueError(
                f"Invalid transition: '{current_status}' → '{new_status}'. "
                f"Allowed transitions from '{current_status}': {allowed}"
            )

        # Optional role check
        if user_id:
            required_role = ROLE_PERMISSIONS.get(new_status, "any")
            if required_role != "any":
                if required_role == "worker" and booking.get("worker_id") != user_id:
                    raise PermissionError(
                        f"Only the assigned worker can transition to '{new_status}'"
                    )
                elif required_role == "customer" and booking.get("customer_id") != user_id:
                    raise PermissionError(
                        f"Only the customer can transition to '{new_status}'"
                    )

        update_data = {
            "status": new_status,
            "updated_at": datetime.utcnow().isoformat(),
        }

        # Add completion timestamp
        if new_status == "completed":
            update_data["completed_at"] = datetime.utcnow().isoformat()
        elif new_status == "cancelled":
            update_data["cancelled_at"] = datetime.utcnow().isoformat()

        return await FirebaseDB.update_document("bookings", booking_id, update_data)

    @staticmethod
    async def get_booking(booking_id: str) -> dict:
        return await FirebaseDB.get_document("bookings", booking_id)

    @staticmethod
    async def get_user_bookings(user_id: str) -> list:
        """Get all bookings where user is customer or worker, deduplicated."""
        as_customer = await FirebaseDB.query_collection(
            "bookings", "customer_id", "==", user_id
        )
        as_worker = await FirebaseDB.query_collection(
            "bookings", "worker_id", "==", user_id
        )
        seen = set()
        all_bookings = []
        for b in as_customer + as_worker:
            if b["id"] not in seen:
                seen.add(b["id"])
                all_bookings.append(b)
        return sorted(
            all_bookings,
            key=lambda x: x.get("created_at", ""),
            reverse=True,
        )
