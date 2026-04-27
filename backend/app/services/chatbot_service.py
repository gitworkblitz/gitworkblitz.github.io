import aiohttp
import os
from ..core.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """You are WorkSphere Assistant, a helpful support bot for a workforce platform in India.
You help users ONLY with:
- Platform navigation and how-to questions
- Finding services (plumbing, cleaning, electrical, AC repair, salon, etc.)
- Booking process and scheduling
- Payment and invoicing questions
- Job and gig browsing help
- Account and profile questions
- Cancellation and refund policies

Always respond in a friendly, professional tone. Keep answers concise (2-3 sentences max).
Use ₹ for Indian Rupee amounts. If asked about real-time data, 
tell users to check the platform directly.
Do NOT answer questions unrelated to WorkSphere platform.
Do NOT claim AI-powered or machine learning capabilities — we use smart matching based on ratings and performance."""


class ChatbotService:
    @staticmethod
    async def get_response(message: str, context: dict = None) -> str:
        """Get AI response from OpenRouter"""
        api_key = settings.OPENROUTER_API_KEY
        
        # If no API key, use fallback immediately
        if not api_key or api_key == "your_openrouter_api_key_here":
            return ChatbotService.fallback_response(message)
        
        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            if context and context.get("history"):
                messages.extend(context["history"][-6:])  # last 3 exchanges
            messages.append({"role": "user", "content": message})

            timeout = aiohttp.ClientTimeout(total=6)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(
                    OPENROUTER_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:5173",
                        "X-Title": "WorkSphere"
                    },
                    json={
                        "model": "openai/gpt-3.5-turbo",
                        "messages": messages,
                        "max_tokens": 300,
                        "temperature": 0.7
                    }
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        return ChatbotService.fallback_response(message)
        except Exception as e:
            print(f"Chatbot error: {e}")
            return ChatbotService.fallback_response(message)

    @staticmethod
    def fallback_response(message: str) -> str:
        """Smart keyword-based fallback responses for Help & FAQ"""
        msg = message.lower()
        
        # Services
        if any(w in msg for w in ["service", "plumb", "electric", "clean", "repair", "paint", "carpenter", "mason"]):
            return "You can find skilled service providers in our Services section. Browse by category — we have 20+ categories including Plumber, Electrician, Carpenter, AC Repair, Salon at Home, and more! 🔧"
        
        # Booking
        if any(w in msg for w in ["book", "appointment", "schedule", "how to book"]):
            return "Booking is easy! Go to Services → select a service → pick a date and time slot → confirm your booking. You can track everything in your Dashboard → My Bookings. 📅"
        
        # Cancel / Refund
        if any(w in msg for w in ["cancel", "refund", "reschedule"]):
            return "You can cancel a booking from My Bookings before the service starts. Refunds are processed within 3-5 business days. To reschedule, cancel and rebook with a new time slot. 🔄"
        
        # Jobs
        if any(w in msg for w in ["job", "work", "career", "employ", "hiring", "vacancy"]):
            return "Check our Jobs section for full-time, part-time, and contract opportunities. Filter by location and skills to find your perfect match! You can also post jobs if you're an employer. 💼"
        
        # Gigs
        if any(w in msg for w in ["gig", "freelance", "project", "short term"]):
            return "Our Gigs marketplace connects freelancers with clients. Browse available gigs or post your own in the Gigs section. Fixed-price projects with clear deliverables! 🚀"
        
        # Payment
        if any(w in msg for w in ["pay", "payment", "invoice", "bill", "price", "₹", "cost", "charge"]):
            return "We support secure payments in ₹ INR. After payment, invoices with GST breakdown are auto-generated. View them in Dashboard → My Invoices. All transactions are tracked. 💳"
        
        # Account
        if any(w in msg for w in ["account", "profile", "signup", "sign up", "register", "login", "password"]):
            return "You can manage your profile from Dashboard → Profile. Update your name, phone, location, and skills. If you forgot your password, use the 'Forgot Password' link on the login page. 👤"
        
        # Track
        if any(w in msg for w in ["track", "status", "where", "progress", "update"]):
            return "Track your booking status from Dashboard → My Bookings. You'll see real-time updates: Requested → Confirmed → In Progress → Completed. 📍"
        
        # Review
        if any(w in msg for w in ["review", "rating", "feedback", "rate"]):
            return "After a booking is completed, you can leave a review with a star rating and tags. Your feedback helps other users find the best professionals! ⭐"
        
        # Matching
        if any(w in msg for w in ["match", "recommend", "suggest", "best worker"]):
            return "Our smart matching ranks workers using: 35% Rating + 25% Experience + 20% Distance + 20% Completion Rate. Visit 'Find Workers' to see top matches for your needs! 📊"
        
        # Contact
        if any(w in msg for w in ["contact", "support", "help", "email", "phone"]):
            return "Need help? Email us at support@worksphere.com or visit the Help Center from the footer. You can also report issues from Dashboard → Report Issue. We're here to help! 📧"
        
        # Greeting
        if any(w in msg for w in ["hello", "hi", "hey", "thanks", "thank"]):
            return "Hello! I'm WorkSphere Assistant. I can help you with booking services, finding jobs/gigs, payments, and account questions. What do you need today? 😊"
        
        return "I can help with: 📋 Booking services, 💼 Finding jobs & gigs, 💳 Payments & invoices, 👤 Account management, and ⭐ Reviews. What would you like to know? 🤔"
