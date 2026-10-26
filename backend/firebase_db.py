import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from config import FIREBASE_CREDENTIALS_PATH, FIREBASE_PROJECT_ID, LOCAL_DB_FILE

logger = logging.getLogger("PartnerIQ.Firebase")

# Try initializing Firebase Admin
firebase_app = None
firestore_client = None
is_live_firebase = False

try:
    import firebase_admin
    from firebase_admin import credentials, firestore

    if os.path.exists(FIREBASE_CREDENTIALS_PATH):
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_app = firebase_admin.initialize_app(cred)
        firestore_client = firestore.client()
        is_live_firebase = True
        logger.info("Connected to Live Firebase Firestore via credentials file.")
    elif FIREBASE_PROJECT_ID:
        firebase_app = firebase_admin.initialize_app(options={'projectId': FIREBASE_PROJECT_ID})
        firestore_client = firestore.client()
        is_live_firebase = True
        logger.info(f"Connected to Live Firebase Firestore with Project ID: {FIREBASE_PROJECT_ID}")
    else:
        logger.info("No Firebase credentials provided. Operating in Local Firestore-Compatible Persistent Mode.")
except Exception as e:
    logger.warning(f"Firebase Admin SDK initialization skipped ({e}). Falling back to Local Firestore Store.")


class LocalFirestoreStore:
    """
    Robust local document store matching Firestore collection/document API.
    Persists data to JSON file so changes survive server restarts.
    """
    def __init__(self, filepath):
        self.filepath = filepath
        self.data: Dict[str, Dict[str, Any]] = {
            "companies": {},
            "evaluations": {},
            "matrices": {},
            "audit_logs": {}
        }
        self._load()

    def _load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    for col in ["companies", "evaluations", "matrices", "audit_logs"]:
                        if col in loaded:
                            self.data[col] = loaded[col]
            except Exception as e:
                logger.error(f"Error loading local store from {self.filepath}: {e}")

    def _save(self):
        try:
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving local store to {self.filepath}: {e}")

    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        return self.data.get(collection, {}).get(doc_id)

    def set_document(self, collection: str, doc_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if collection not in self.data:
            self.data[collection] = {}
        payload["id"] = doc_id
        payload["updated_at"] = datetime.utcnow().isoformat()
        if "created_at" not in payload:
            payload["created_at"] = datetime.utcnow().isoformat()
        self.data[collection][doc_id] = payload
        self._save()
        return payload

    def update_document(self, collection: str, doc_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if collection in self.data and doc_id in self.data[collection]:
            self.data[collection][doc_id].update(updates)
            self.data[collection][doc_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save()
            return self.data[collection][doc_id]
        return None

    def delete_document(self, collection: str, doc_id: str) -> bool:
        if collection in self.data and doc_id in self.data[collection]:
            del self.data[collection][doc_id]
            self._save()
            return True
        return False

    def list_collection(self, collection: str) -> List[Dict[str, Any]]:
        return list(self.data.get(collection, {}).values())


local_store = LocalFirestoreStore(LOCAL_DB_FILE)


class DatabaseAdapter:
    """Unified Adapter for Firestore and Local Store"""

    @staticmethod
    def is_live() -> bool:
        return is_live_firebase

    @staticmethod
    def get_status() -> Dict[str, Any]:
        company_count = len(DatabaseAdapter.list_companies())
        eval_count = len(DatabaseAdapter.list_evaluations())
        matrix_count = len(DatabaseAdapter.list_matrices())
        return {
            "mode": "live_firestore" if is_live_firebase else "local_firestore_compatible",
            "is_live": is_live_firebase,
            "project_id": FIREBASE_PROJECT_ID or ("Live via Service Account" if is_live_firebase else "demo-partneriq-firebase"),
            "collections": {
                "companies": company_count,
                "evaluations": eval_count,
                "matrices": matrix_count
            },
            "storage_path": str(LOCAL_DB_FILE) if not is_live_firebase else "Google Cloud Firestore"
        }

    # Companies Collection
    @staticmethod
    def get_company(company_id: str) -> Optional[Dict[str, Any]]:
        if is_live_firebase and firestore_client:
            try:
                doc = firestore_client.collection("companies").document(company_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                logger.warning(f"Firestore get error: {e}. Falling back to cache.")
        return local_store.get_document("companies", company_id)

    @staticmethod
    def save_company(company_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = company_id
        data["updated_at"] = datetime.utcnow().isoformat()
        if "created_at" not in data:
            data["created_at"] = datetime.utcnow().isoformat()

        # Cache locally
        local_store.set_document("companies", company_id, data)

        # Sync to live Firestore
        if is_live_firebase and firestore_client:
            try:
                firestore_client.collection("companies").document(company_id).set(data)
                logger.info(f"Synchronized company '{company_id}' live to Google Cloud Firestore.")
            except Exception as e:
                logger.error(f"Live Firestore sync error for {company_id}: {e}")

        return data

    @staticmethod
    def list_companies() -> List[Dict[str, Any]]:
        if is_live_firebase and firestore_client:
            try:
                docs = firestore_client.collection("companies").stream()
                cloud_items = [d.to_dict() for d in docs]
                if cloud_items:
                    return cloud_items
            except Exception as e:
                logger.warning(f"Firestore list error: {e}. Using local cache.")
        return local_store.list_collection("companies")

    @staticmethod
    def delete_company(company_id: str) -> bool:
        if is_live_firebase and firestore_client:
            try:
                firestore_client.collection("companies").document(company_id).delete()
            except Exception as e:
                logger.warning(f"Firestore delete error: {e}")
        return local_store.delete_document("companies", company_id)

    # Evaluations Collection
    @staticmethod
    def get_evaluation(company_id: str) -> Optional[Dict[str, Any]]:
        if is_live_firebase and firestore_client:
            try:
                doc = firestore_client.collection("evaluations").document(company_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                logger.warning(f"Firestore evaluation get error: {e}")
        return local_store.get_document("evaluations", company_id)

    @staticmethod
    def save_evaluation(company_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data["company_id"] = company_id
        data["updated_at"] = datetime.utcnow().isoformat()
        
        # Cache locally
        local_store.set_document("evaluations", company_id, data)

        # Sync to live Firestore
        if is_live_firebase and firestore_client:
            try:
                firestore_client.collection("evaluations").document(company_id).set(data)
                logger.info(f"Synchronized evaluation '{company_id}' live to Google Cloud Firestore.")
            except Exception as e:
                logger.error(f"Live Firestore evaluation sync error for {company_id}: {e}")

        return data

    @staticmethod
    def list_evaluations() -> List[Dict[str, Any]]:
        if is_live_firebase and firestore_client:
            try:
                docs = firestore_client.collection("evaluations").stream()
                cloud_items = [d.to_dict() for d in docs]
                if cloud_items:
                    return cloud_items
            except Exception as e:
                logger.warning(f"Firestore list evaluations error: {e}")
        return local_store.list_collection("evaluations")

    # Matrices Collection (Comparison Sessions)
    @staticmethod
    def save_matrix(matrix_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        local_store.set_document("matrices", matrix_id, data)
        if is_live_firebase and firestore_client:
            try:
                data["id"] = matrix_id
                data["updated_at"] = datetime.utcnow().isoformat()
                firestore_client.collection("matrices").document(matrix_id).set(data)
            except Exception as e:
                logger.warning(f"Firestore save matrix error: {e}")
        return data

    @staticmethod
    def get_matrix(matrix_id: str) -> Optional[Dict[str, Any]]:
        if is_live_firebase and firestore_client:
            try:
                doc = firestore_client.collection("matrices").document(matrix_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                logger.warning(f"Firestore get matrix error: {e}")
        return local_store.get_document("matrices", matrix_id)

    @staticmethod
    def list_matrices() -> List[Dict[str, Any]]:
        if is_live_firebase and firestore_client:
            try:
                docs = firestore_client.collection("matrices").stream()
                cloud_items = [d.to_dict() for d in docs]
                if cloud_items:
                    return cloud_items
            except Exception as e:
                logger.warning(f"Firestore list matrices error: {e}")
        return local_store.list_collection("matrices")

    # Audit Logs
    @staticmethod
    def log_audit_event(action: str, details: Dict[str, Any]):
        log_entry = {
            "id": f"log_{int(datetime.utcnow().timestamp()*1000)}",
            "action": action,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        local_store.set_document("audit_logs", log_entry["id"], log_entry)
        if is_live_firebase and firestore_client:
            try:
                firestore_client.collection("audit_logs").document(log_entry["id"]).set(log_entry)
            except Exception as e:
                logger.warning(f"Firestore audit log error: {e}")
