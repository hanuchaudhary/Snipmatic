import json
import os
import uuid

import redis

from app.utils.types import JobStatus


CHANNEL = "snipmatic:project-events"


class API:
    def __init__(self):
        url = os.environ.get("REDIS_URL")
        if not url:
            raise ValueError("REDIS_URL is not set")
        self.redis = redis.Redis.from_url(url)

    def _send(self, event: dict):
        acknowledgement = f"snipmatic:project-ack:{uuid.uuid4()}"
        with self.redis.pubsub() as subscription:
            subscription.subscribe(acknowledgement)
            subscribed = subscription.get_message(timeout=10)
            if subscribed is None or subscribed["type"] != "subscribe":
                raise TimeoutError("Could not subscribe to project acknowledgement channel")
            event["acknowledgement"] = acknowledgement
            if self.redis.publish(CHANNEL, json.dumps(event)) < 1:
                raise RuntimeError("No project event subscriber is running")
            while True:
                message = subscription.get_message(timeout=60)
                if message is None:
                    raise TimeoutError("Timed out waiting for project database update")
                if message["type"] != "message":
                    continue
                result = json.loads(message["data"])
                if not result.get("ok"):
                    raise RuntimeError(result.get("error", "Project database update failed"))
                return

    def update_job(self, job_id: str, status: JobStatus, progress: int | None = None, **metadata):
        data = {"status": status.value}
        if progress is not None:
            data["progress"] = progress
        data.update({key: value for key, value in metadata.items() if value is not None})
        self._send({"kind": "update", "projectId": job_id, "data": data})

    def complete_job(self, job_id: str, clips: list[dict]):
        self._send({"kind": "complete", "projectId": job_id, "data": {"clips": clips}})
