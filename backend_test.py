#!/usr/bin/env python3
"""
Backend API Testing Script for StudySage
Tests homework solving, session deletion, and document deletion endpoints
"""

import requests
import json
import os
import tempfile
from PIL import Image, ImageDraw, ImageFont
import io
import base64
from pathlib import Path

# Backend URL from frontend/.env
BACKEND_URL = "https://learngenius-6.preview.emergentagent.com/api"

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "test123"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        
    def authenticate(self):
        """Authenticate with test credentials"""
        print("🔐 Authenticating with test credentials...")
        
        # Try to login first
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        response = self.session.post(f"{BACKEND_URL}/auth/login", json=login_data)
        
        if response.status_code == 401:
            print("   User doesn't exist, creating account...")
            # Create account if login fails
            signup_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": "Test User"
            }
            
            response = self.session.post(f"{BACKEND_URL}/auth/signup", json=signup_data)
            
        if response.status_code == 200:
            data = response.json()
            self.auth_token = data["access_token"]
            self.user_id = data["user"]["id"]
            self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
            print(f"   ✅ Authentication successful - User ID: {self.user_id}")
            return True
        else:
            print(f"   ❌ Authentication failed: {response.status_code} - {response.text}")
            return False
    
    def create_test_image(self):
        """Create a simple test image with homework question"""
        print("📸 Creating test homework image...")
        
        # Create a simple image with text
        img = Image.new('RGB', (800, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a font, fallback to default if not available
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        # Add homework question text
        question_text = """Math Problem:
        
Solve for x:
2x + 5 = 15

Show your work step by step."""
        
        draw.text((50, 50), question_text, fill='black', font=font)
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
        img.save(temp_file.name, 'PNG')
        print(f"   ✅ Test image created: {temp_file.name}")
        return temp_file.name
    
    def test_homework_solve_endpoint(self):
        """Test the /api/homework/solve endpoint"""
        print("\n🧮 Testing homework solving endpoint...")
        
        # First create a homework session
        session_data = {
            "type": "homework",
            "name": "Test Homework Session",
            "config": {}
        }
        
        response = self.session.post(f"{BACKEND_URL}/sessions", json=session_data)
        if response.status_code != 200:
            print(f"   ❌ Failed to create session: {response.status_code} - {response.text}")
            return False
        
        session_id = response.json()["id"]
        print(f"   ✅ Created homework session: {session_id}")
        
        # Create test image
        image_path = self.create_test_image()
        
        try:
            # Upload homework image for solving
            with open(image_path, 'rb') as img_file:
                files = {'file': ('homework.png', img_file, 'image/png')}
                data = {'session_id': session_id}
                
                response = self.session.post(f"{BACKEND_URL}/homework/solve", files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Homework solved successfully")
                print(f"   📝 Solution preview: {result['solution'][:100]}...")
                
                # Verify messages were saved
                messages_response = self.session.get(f"{BACKEND_URL}/sessions/{session_id}/messages")
                if messages_response.status_code == 200:
                    messages = messages_response.json()
                    print(f"   ✅ Found {len(messages)} messages in session")
                    
                    # Check for user image message and assistant solution
                    user_messages = [m for m in messages if m['role'] == 'user']
                    assistant_messages = [m for m in messages if m['role'] == 'assistant']
                    
                    if user_messages and assistant_messages:
                        print(f"   ✅ Messages saved correctly - {len(user_messages)} user, {len(assistant_messages)} assistant")
                        return True
                    else:
                        print(f"   ❌ Messages not saved properly - {len(user_messages)} user, {len(assistant_messages)} assistant")
                        return False
                else:
                    print(f"   ❌ Failed to retrieve messages: {messages_response.status_code}")
                    return False
            else:
                print(f"   ❌ Homework solve failed: {response.status_code} - {response.text}")
                return False
                
        finally:
            # Clean up temp file
            os.unlink(image_path)
    
    def test_session_deletion(self):
        """Test session deletion endpoint"""
        print("\n🗑️ Testing session deletion...")
        
        # Create a test session
        session_data = {
            "type": "qa",
            "name": "Test Session for Deletion",
            "config": {}
        }
        
        response = self.session.post(f"{BACKEND_URL}/sessions", json=session_data)
        if response.status_code != 200:
            print(f"   ❌ Failed to create session: {response.status_code} - {response.text}")
            return False
        
        session_id = response.json()["id"]
        print(f"   ✅ Created test session: {session_id}")
        
        # Add a test message to the session
        message_data = {
            "role": "user",
            "content": "Test message for deletion"
        }
        
        response = self.session.post(f"{BACKEND_URL}/sessions/{session_id}/messages", json=message_data)
        if response.status_code != 200:
            print(f"   ❌ Failed to create message: {response.status_code}")
            return False
        
        print(f"   ✅ Added test message to session")
        
        # Delete the session
        response = self.session.delete(f"{BACKEND_URL}/sessions/{session_id}")
        
        if response.status_code == 200:
            print(f"   ✅ Session deleted successfully")
            
            # Verify session is gone
            response = self.session.get(f"{BACKEND_URL}/sessions/{session_id}")
            if response.status_code == 404:
                print(f"   ✅ Session properly removed from database")
                
                # Verify messages are also deleted
                response = self.session.get(f"{BACKEND_URL}/sessions/{session_id}/messages")
                if response.status_code == 404:
                    print(f"   ✅ Associated messages also deleted")
                    return True
                else:
                    print(f"   ❌ Messages not deleted: {response.status_code}")
                    return False
            else:
                print(f"   ❌ Session still exists: {response.status_code}")
                return False
        else:
            print(f"   ❌ Session deletion failed: {response.status_code} - {response.text}")
            return False
    
    def test_document_deletion(self):
        """Test document deletion endpoint"""
        print("\n📄 Testing document deletion...")
        
        # Create a test document
        test_content = "This is a test document for deletion testing."
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt')
        temp_file.write(test_content)
        temp_file.close()
        
        try:
            # Upload document
            with open(temp_file.name, 'rb') as doc_file:
                files = {'file': ('test_document.txt', doc_file, 'text/plain')}
                data = {'is_global': 'true', 'is_exam_prep': 'false'}
                
                response = self.session.post(f"{BACKEND_URL}/documents/upload", files=files, data=data)
            
            if response.status_code != 200:
                print(f"   ❌ Failed to upload document: {response.status_code} - {response.text}")
                return False
            
            document_id = response.json()["id"]
            file_path = response.json()["file_path"]
            print(f"   ✅ Uploaded test document: {document_id}")
            print(f"   📁 File path: {file_path}")
            
            # Verify document exists
            response = self.session.get(f"{BACKEND_URL}/documents")
            if response.status_code == 200:
                documents = response.json()
                doc_exists = any(doc['id'] == document_id for doc in documents)
                if doc_exists:
                    print(f"   ✅ Document found in database")
                else:
                    print(f"   ❌ Document not found in database")
                    return False
            
            # Delete the document
            response = self.session.delete(f"{BACKEND_URL}/documents/{document_id}")
            
            if response.status_code == 200:
                print(f"   ✅ Document deleted successfully")
                
                # Verify document is removed from database
                response = self.session.get(f"{BACKEND_URL}/documents")
                if response.status_code == 200:
                    documents = response.json()
                    doc_exists = any(doc['id'] == document_id for doc in documents)
                    if not doc_exists:
                        print(f"   ✅ Document removed from database")
                        
                        # Note: Can't verify file deletion in this environment
                        # but the API should handle it
                        print(f"   ℹ️ File deletion handled by API (cannot verify in test environment)")
                        return True
                    else:
                        print(f"   ❌ Document still exists in database")
                        return False
                else:
                    print(f"   ❌ Failed to check documents: {response.status_code}")
                    return False
            else:
                print(f"   ❌ Document deletion failed: {response.status_code} - {response.text}")
                return False
                
        finally:
            # Clean up temp file
            os.unlink(temp_file.name)
    
    def test_api_prefix_validation(self):
        """Test that all endpoints use proper /api prefix"""
        print("\n🔗 Testing API prefix validation...")
        
        # Test endpoints without /api prefix should fail
        test_endpoints = [
            "/sessions",
            "/documents", 
            "/homework/solve"
        ]
        
        base_url = "https://learngenius-6.preview.emergentagent.com"
        
        for endpoint in test_endpoints:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 404:
                print(f"   ✅ {endpoint} properly requires /api prefix")
            else:
                print(f"   ❌ {endpoint} accessible without /api prefix: {response.status_code}")
                return False
        
        return True
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests for StudySage")
        print("=" * 50)
        
        if not self.authenticate():
            return False
        
        results = {
            "homework_solve": self.test_homework_solve_endpoint(),
            "session_deletion": self.test_session_deletion(), 
            "document_deletion": self.test_document_deletion(),
            "api_prefix": self.test_api_prefix_validation()
        }
        
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        
        all_passed = True
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
            if not result:
                all_passed = False
        
        print(f"\nOverall Status: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
        return all_passed

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)