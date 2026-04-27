import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth, storage
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK once
_initialized = False

def initialize_firebase():
    global _initialized
    if not _initialized and not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")
        storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "uworkerconnect.firebasestorage.app")
        options = {'storageBucket': storage_bucket}
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, options)
        else:
            # For development without credentials file
            print("WARNING: Firebase credentials file not found. Using mock mode.")
            firebase_admin.initialize_app(options=options)
        _initialized = True

initialize_firebase()

try:
    db = firestore.client()
except Exception as e:
    print(f"Firestore init warning: {e}")
    db = None


class FirebaseDB:
    @staticmethod
    async def create_document(collection: str, data: dict, doc_id: str = None) -> str:
        """Create a document in Firestore"""
        try:
            col_ref = db.collection(collection)
            if doc_id:
                await asyncio.to_thread(col_ref.document(doc_id).set, data)
                return doc_id
            else:
                def add_doc():
                    return col_ref.add(data)
                _, doc_ref = await asyncio.to_thread(add_doc)
                return doc_ref.id
        except Exception as e:
            print(f"Error creating document: {e}")
            raise

    @staticmethod
    async def get_document(collection: str, doc_id: str) -> dict:
        """Get a single document"""
        try:
            doc = await asyncio.to_thread(db.collection(collection).document(doc_id).get)
            if doc.exists:
                return {**doc.to_dict(), "id": doc.id}
            return None
        except Exception as e:
            print(f"Error getting document: {e}")
            return None

    @staticmethod
    async def update_document(collection: str, doc_id: str, data: dict) -> bool:
        """Update a document"""
        try:
            await asyncio.to_thread(db.collection(collection).document(doc_id).update, data)
            return True
        except Exception as e:
            print(f"Error updating document: {e}")
            return False

    @staticmethod
    async def delete_document(collection: str, doc_id: str) -> bool:
        """Delete a document"""
        try:
            await asyncio.to_thread(db.collection(collection).document(doc_id).delete)
            return True
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False

    @staticmethod
    async def get_all(collection: str, limit_count: int = 100) -> list:
        """Get all documents in a collection with an optional limit to prevent full scans"""
        try:
            def fetch_all():
                return list(db.collection(collection).limit(limit_count).stream())
            docs = await asyncio.to_thread(fetch_all)
            return [{**doc.to_dict(), "id": doc.id} for doc in docs]
        except Exception as e:
            print(f"Error getting all documents: {e}")
            return []

    @staticmethod
    async def query_collection(collection: str, field: str, operator: str, value, limit_count: int = 100) -> list:
        """Query a collection with a single filter"""
        try:
            def fetch_query():
                return list(db.collection(collection).where(field, operator, value).limit(limit_count).stream())
            docs = await asyncio.to_thread(fetch_query)
            return [{**doc.to_dict(), "id": doc.id} for doc in docs]
        except Exception as e:
            print(f"Error querying collection: {e}")
            return []

    @staticmethod
    async def query_multiple(collection: str, filters: list, limit_count: int = 100) -> list:
        """Query with multiple filters: [(field, op, value), ...]"""
        try:
            def fetch_multi():
                q = db.collection(collection)
                for field, operator, value in filters:
                    q = q.where(field, operator, value)
                return list(q.limit(limit_count).stream())
            docs = await asyncio.to_thread(fetch_multi)
            return [{**doc.to_dict(), "id": doc.id} for doc in docs]
        except Exception as e:
            print(f"Error querying collection: {e}")
            return []

    @staticmethod
    async def verify_token(token: str) -> dict:
        """Verify Firebase ID token"""
        try:
            decoded = firebase_auth.verify_id_token(token)
            return decoded
        except Exception as e:
            print(f"Token verification error: {e}")
            return None

    @staticmethod
    async def upload_pdf(file_path: str, destination_blob_name: str) -> str:
        """Upload a PDF file to Firebase Storage and return the public URL"""
        try:
            bucket = storage.bucket()
            blob = bucket.blob(destination_blob_name)
            
            # Set metadata to force download/preview properly
            blob.upload_from_filename(
                file_path,
                content_type='application/pdf'
            )
            blob.make_public()
            return blob.public_url
        except Exception as e:
            print(f"Error uploading PDF to Firebase Storage: {e}")
            return None
