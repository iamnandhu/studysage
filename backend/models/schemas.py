from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    name: str
    email: EmailStr
    hashed_password: str
    phone: Optional[str] = None
    credits: int = 10
    subscription_status: str = "free"  # free, active, expired
    subscription_expires_at: Optional[datetime] = None
    age: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.now)

class Session(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    user_id: str
    type: str  # exam_prep, qa, homework
    name: str
    config: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.now)

class Document(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    user_id: str
    session_id: Optional[str] = None
    filename: str
    file_path: str
    file_type: str
    file_size: int
    page_count: Optional[int] = None
    is_global: bool = False
    uploaded_at: datetime = Field(default_factory=datetime.now)
    
class ChatMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    session_id: str
    role: str  # user, assistant
    content: str
    question: Optional[str] = None
    sources: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)

class StudyMaterial(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    user_id: str
    document_id: str
    type: str  # summary, flashcards, mindmap
    content: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.now)

class DocumentChunk(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    document_id: str
    user_id: str
    chunk_index: int
    content: str
    page_number: Optional[int] = None
    embedding: List[float] = []
    created_at: datetime = Field(default_factory=datetime.now)

class PaymentOrder(BaseModel):
    amount: int  # in paise
    currency: str = "INR"
    credits: int
    user_id: str
    
class Subscription(BaseModel):
    user_id: str
    plan: str  # monthly, yearly
    amount: int
    start_date: datetime
    end_date: datetime
    status: str  # active, cancelled, expired
