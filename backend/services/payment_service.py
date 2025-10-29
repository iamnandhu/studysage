import os
import razorpay
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

class PaymentService:
    def __init__(self, db):
        self.db = db
        # Use test credentials for development
        self.key_id = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_placeholder')
        self.key_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'test_secret_placeholder')
        self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
        
    async def create_credit_order(self, user_id: str, credits: int, amount: int) -> Dict[str, Any]:
        """Create Razorpay order for credit purchase"""
        try:
            # Create Razorpay order
            order_data = {
                "amount": amount * 100,  # Convert to paise
                "currency": "INR",
                "payment_capture": 1,
                "notes": {
                    "user_id": user_id,
                    "credits": credits,
                    "type": "credit_purchase"
                }
            }
            
            razorpay_order = self.client.order.create(data=order_data)
            
            # Store order in database
            order_doc = {
                "order_id": razorpay_order["id"],
                "user_id": user_id,
                "amount": amount,
                "credits": credits,
                "status": "created",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.payment_orders.insert_one(order_doc)
            
            return razorpay_order
            
        except Exception as e:
            raise Exception(f"Error creating order: {str(e)}")
    
    async def verify_payment(self, order_id: str, payment_id: str, signature: str) -> bool:
        """Verify Razorpay payment signature"""
        try:
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            
            self.client.utility.verify_payment_signature(params_dict)
            return True
            
        except razorpay.errors.SignatureVerificationError:
            return False
    
    async def process_successful_payment(self, order_id: str, payment_id: str):
        """Process successful payment and add credits"""
        # Get order details
        order = await self.db.payment_orders.find_one({"order_id": order_id})
        
        if not order:
            raise Exception("Order not found")
        
        # Add credits to user
        result = await self.db.users.update_one(
            {"id": order["user_id"]},
            {"$inc": {"credits": order["credits"]}}
        )
        
        # Update order status
        await self.db.payment_orders.update_one(
            {"order_id": order_id},
            {
                "$set": {
                    "status": "completed",
                    "payment_id": payment_id,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "success": True,
            "credits_added": order["credits"]
        }
    
    async def create_subscription_order(self, user_id: str, plan: str) -> Dict[str, Any]:
        """Create subscription order"""
        # Define subscription plans
        plans = {
            "monthly": {"amount": 399, "duration_days": 30},
            "yearly": {"amount": 3999, "duration_days": 365}
        }
        
        if plan not in plans:
            raise Exception("Invalid plan")
        
        plan_details = plans[plan]
        
        try:
            # Create Razorpay order
            order_data = {
                "amount": plan_details["amount"] * 100,
                "currency": "INR",
                "payment_capture": 1,
                "notes": {
                    "user_id": user_id,
                    "type": "subscription",
                    "plan": plan
                }
            }
            
            razorpay_order = self.client.order.create(data=order_data)
            
            # Store subscription order
            order_doc = {
                "order_id": razorpay_order["id"],
                "user_id": user_id,
                "plan": plan,
                "amount": plan_details["amount"],
                "duration_days": plan_details["duration_days"],
                "status": "created",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.subscription_orders.insert_one(order_doc)
            
            return razorpay_order
            
        except Exception as e:
            raise Exception(f"Error creating subscription order: {str(e)}")
    
    async def activate_subscription(self, order_id: str, payment_id: str):
        """Activate user subscription after successful payment"""
        # Get subscription order
        order = await self.db.subscription_orders.find_one({"order_id": order_id})
        
        if not order:
            raise Exception("Subscription order not found")
        
        # Calculate subscription dates
        start_date = datetime.now(timezone.utc)
        end_date = start_date + timedelta(days=order["duration_days"])
        
        # Update user subscription
        await self.db.users.update_one(
            {"id": order["user_id"]},
            {
                "$set": {
                    "subscription_status": "active",
                    "subscription_expires_at": end_date.isoformat(),
                    "subscription_plan": order["plan"]
                }
            }
        )
        
        # Update subscription order
        await self.db.subscription_orders.update_one(
            {"order_id": order_id},
            {
                "$set": {
                    "status": "completed",
                    "payment_id": payment_id,
                    "activated_at": start_date.isoformat(),
                    "expires_at": end_date.isoformat()
                }
            }
        )
        
        return {
            "success": True,
            "subscription_active_until": end_date.isoformat()
        }
