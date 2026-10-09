import requests
import os
from app.utils.types import ClipStatus, JobStatus

class API:
    def __init__(self):
        self.base_url = os.getenv("API_URL", "http://localhost:8000") 
        self.api_key = os.getenv("API_KEY", "secret")

    def update_job(self, job_id: str, status: JobStatus, progress: int = None, error: str = None):
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
            response = requests.patch(f"{self.base_url}/clip/{job_id}", json=data, headers=headers)
            return response.json()
        except Exception as e:
            print(f"Error updating job: {e}")
            raise e

    def update_clip(self, clip_id: str, status: ClipStatus = None, outputKey: str = None, error: str = None, thumbnail: str = None, duration: float = None, subtitlesKey: str = None):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        try:
            data = {}
            if status is not None:
                data["status"] = status
            if outputKey is not None:
                data["outputKey"] = outputKey
            if error is not None:
                data["error"] = error
            if thumbnail is not None:
                data["thumbnail"] = thumbnail
            if duration is not None:
                data["duration"] = duration
            if subtitlesKey is not None:
                data["subtitlesKey"] = subtitlesKey
            response = requests.patch(f"{self.base_url}/clip/output/{clip_id}", json=data, headers=headers)
            return response.json()
        except Exception as e:
            print(f"Error updating clip: {e}")
            raise e
