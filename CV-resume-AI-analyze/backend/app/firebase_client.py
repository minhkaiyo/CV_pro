import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage

def init_firebase():
    if not firebase_admin._apps:
        # Trong production, cần lấy credential từ ENV
        # Ví dụ: cred = credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"]))
        # Ở đây mock default để app không lỗi:
        try:
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {
                'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', 'my-bucket.appspot.com')
            })
        except Exception as e:
            # Fallback nếu chưa có config
            print("Firebase config missing. Running in mock mode.")
            pass

def get_db():
    init_firebase()
    return firestore.client()

def get_auth():
    init_firebase()
    return auth

def get_storage():
    init_firebase()
    return storage.bucket()
