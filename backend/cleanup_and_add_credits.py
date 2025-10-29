from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL')

async def cleanup_and_add_credits():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.studysage
    
    print("Cleaning up data...")
    
    # Clear all collections except users
    collections_to_clear = [
        'sessions_data',
        'chat_messages',
        'documents',
        'study_materials'
    ]
    
    for collection in collections_to_clear:
        result = await db[collection].delete_many({})
        print(f"✓ Cleared {collection}: {result.deleted_count} documents")
    
    # Clear upload directories
    upload_dirs = [
        Path('/app/backend/uploads/documents'),
        Path('/app/backend/uploads/homework')
    ]
    
    for upload_dir in upload_dirs:
        if upload_dir.exists():
            for file in upload_dir.glob('*'):
                if file.is_file():
                    file.unlink()
            print(f"✓ Cleared {upload_dir}")
    
    # Add 50 credits to all existing users
    result = await db.users.update_many(
        {},
        {"$set": {"credits": 50}}
    )
    print(f"\n✓ Updated {result.modified_count} users with 50 credits")
    
    print("\n✅ Database cleaned and credits added!")
    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_and_add_credits())
