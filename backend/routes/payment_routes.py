from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["payments"])

class CreditPurchase(BaseModel):
    credits: int
    amount: int

class PaymentVerification(BaseModel):
    order_id: str
    payment_id: str
    signature: str

class SubscriptionPurchase(BaseModel):
    plan: str  # monthly or yearly

# This will be initialized in main server file
payment_service: PaymentService = None

def init_payment_routes(db, get_current_user_func):
    global payment_service
    payment_service = PaymentService(db)
    
    @router.get("/config")
    async def get_payment_config(current_user: dict = Depends(get_current_user_func)):
        """Get Razorpay configuration for frontend"""
        return {
            "key_id": payment_service.key_id,
            "currency": "INR"
        }
    
    @router.post("/create-credit-order")
    async def create_credit_order(
        purchase: CreditPurchase,
        current_user: dict = Depends(get_current_user_func)
    ):
        """Create order for credit purchase"""
        try:
            order = await payment_service.create_credit_order(
                user_id=current_user.id,
                credits=purchase.credits,
                amount=purchase.amount
            )
            return order
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/verify-credit-payment")
    async def verify_credit_payment(
        verification: PaymentVerification,
        current_user: dict = Depends(get_current_user_func)
    ):
        """Verify and process credit payment"""
        try:
            # Verify signature
            is_valid = await payment_service.verify_payment(
                order_id=verification.order_id,
                payment_id=verification.payment_id,
                signature=verification.signature
            )
            
            if not is_valid:
                raise HTTPException(status_code=400, detail="Invalid payment signature")
            
            # Process payment
            result = await payment_service.process_successful_payment(
                order_id=verification.order_id,
                payment_id=verification.payment_id
            )
            
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/create-subscription-order")
    async def create_subscription_order(
        subscription: SubscriptionPurchase,
        current_user: dict = Depends(get_current_user_func)
    ):
        """Create order for subscription"""
        try:
            order = await payment_service.create_subscription_order(
                user_id=current_user.id,
                plan=subscription.plan
            )
            return order
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/verify-subscription-payment")
    async def verify_subscription_payment(
        verification: PaymentVerification,
        current_user: dict = Depends(get_current_user_func)
    ):
        """Verify and activate subscription"""
        try:
            # Verify signature
            is_valid = await payment_service.verify_payment(
                order_id=verification.order_id,
                payment_id=verification.payment_id,
                signature=verification.signature
            )
            
            if not is_valid:
                raise HTTPException(status_code=400, detail="Invalid payment signature")
            
            # Activate subscription
            result = await payment_service.activate_subscription(
                order_id=verification.order_id,
                payment_id=verification.payment_id
            )
            
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return router
