import os
from typing import List, Dict, Any
import openai
from pathlib import Path
import PyPDF2
from docx import Document as DocxDocument
import uuid
from datetime import datetime, timezone

class RAGService:
    def __init__(self, db):
        self.db = db
        self.chunk_size = 1000
        self.chunk_overlap = 200
        self._openai_client = None
        self._emergent_llm_key = None
    
    @property
    def openai_client(self):
        """Lazy initialization of OpenAI client"""
        if self._openai_client is None:
            if self._emergent_llm_key is None:
                self._emergent_llm_key = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-placeholder')
            self._openai_client = openai.OpenAI(api_key=self._emergent_llm_key)
        return self._openai_client
        
    def extract_text_from_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract text from PDF with page numbers"""
        chunks = []
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages, 1):
                text = page.extract_text()
                if text.strip():
                    # Split page into chunks if too large
                    page_chunks = self._split_text(text, page_num)
                    chunks.extend(page_chunks)
        return chunks
    
    def _split_text(self, text: str, page_num: int) -> List[Dict[str, Any]]:
        """Split text into overlapping chunks"""
        chunks = []
        words = text.split()
        
        for i in range(0, len(words), self.chunk_size - self.chunk_overlap):
            chunk_words = words[i:i + self.chunk_size]
            chunk_text = ' '.join(chunk_words)
            chunks.append({
                'content': chunk_text,
                'page_number': page_num
            })
        
        return chunks
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI"""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return []
    
    async def process_document(self, document_id: str, user_id: str, file_path: str, file_type: str):
        """Process document and store chunks with embeddings"""
        # Extract text
        if file_type == 'application/pdf':
            chunks = self.extract_text_from_pdf(file_path)
        else:
            # Handle other file types if needed
            chunks = []
        
        # Generate embeddings and store chunks
        for idx, chunk in enumerate(chunks):
            embedding = await self.generate_embedding(chunk['content'])
            
            chunk_doc = {
                'id': str(uuid.uuid4()),
                'document_id': document_id,
                'user_id': user_id,
                'chunk_index': idx,
                'content': chunk['content'],
                'page_number': chunk.get('page_number'),
                'embedding': embedding,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.document_chunks.insert_one(chunk_doc)
        
        return len(chunks)
    
    async def search_similar_chunks(self, query: str, document_ids: List[str], user_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar chunks using vector similarity"""
        # Generate query embedding
        query_embedding = await self.generate_embedding(query)
        
        if not query_embedding:
            return []
        
        # MongoDB vector search pipeline
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "document_embeddings_index",
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": top_k * 10,
                    "limit": top_k,
                    "filter": {
                        "user_id": user_id,
                        "document_id": {"$in": document_ids}
                    }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "id": 1,
                    "document_id": 1,
                    "content": 1,
                    "page_number": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        try:
            results = await self.db.document_chunks.aggregate(pipeline).to_list(top_k)
            return results
        except Exception as e:
            print(f"Vector search error: {e}")
            # Fallback to text search if vector search fails
            return await self._fallback_text_search(query, document_ids, user_id, top_k)
    
    async def _fallback_text_search(self, query: str, document_ids: List[str], user_id: str, top_k: int) -> List[Dict[str, Any]]:
        """Fallback text-based search"""
        chunks = await self.db.document_chunks.find({
            'user_id': user_id,
            'document_id': {'$in': document_ids},
            '$text': {'$search': query}
        }, {'_id': 0}).limit(top_k).to_list(top_k)
        
        return chunks
    
    async def generate_answer_with_context(self, query: str, relevant_chunks: List[Dict[str, Any]], age: int = None) -> Dict[str, Any]:
        """Generate answer using LLM with retrieved context"""
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Get API key
        emergent_llm_key = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-placeholder')
        
        # Prepare context
        context = "\n\n".join([
            f"[Document {chunk['document_id']}, Page {chunk.get('page_number', 'N/A')}]:\n{chunk['content']}"
            for chunk in relevant_chunks
        ])
        
        # Create system message
        system_message = f"You are an expert study assistant. Answer questions based ONLY on the provided context. Include citations with document ID and page numbers. The student is {age} years old." if age else "You are an expert study assistant. Answer questions based ONLY on the provided context. Include citations with document ID and page numbers."
        
        chat = LlmChat(
            api_key=emergent_llm_key,
            session_id=f"rag_{uuid.uuid4()}",
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(
            text=f"Context:\n{context}\n\nQuestion: {query}\n\nProvide a detailed answer with specific citations (document ID and page numbers)."
        )
        
        try:
            answer = await chat.send_message(user_message)
            
            # Extract sources from relevant chunks
            sources = []
            for chunk in relevant_chunks:
                sources.append({
                    'document_id': chunk['document_id'],
                    'page': chunk.get('page_number'),
                    'score': chunk.get('score', 0)
                })
            
            return {
                'answer': answer,
                'sources': sources,
                'context_used': len(relevant_chunks)
            }
        except Exception as e:
            raise Exception(f"Error generating answer: {str(e)}")
