import requests
import os
from app.utils.types import ClipStatus

class API:
    def __init__(self):
        self.base_url = os.getenv("API_URL", "http://localhost:8000") 
        self.api_key = os.getenv("API_KEY", "secret")

    def update_job(self, job_id: str, status: ClipStatus, progress: int = None, error: str = None, finalKeys: list[str] = None):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        try:
            data = {
                "status": status,
            }
            if progress is not None:
                data["progress"] = progress
            if error is not None:
                data["error"] = error
            if finalKeys is not None:
                data["finalKeys"] = finalKeys
            response = requests.patch(f"{self.base_url}/clip/{job_id}", json=data, headers=headers)
            return response.json()
        except Exception as e:
            print(f"Error updating job: {e}")
            raise e