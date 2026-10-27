import json
import sys
import tempfile
from pathlib import Path

from dotenv import load_dotenv

from app.runner import run_pipeline
from app.utils.types import JobPayload


def main():
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    payload = JobPayload.model_validate(json.load(sys.stdin))
    with tempfile.TemporaryDirectory(prefix=f"clip-{payload.projectId}-") as workspace:
        print(json.dumps(run_pipeline(payload, workspace)))


if __name__ == "__main__":
    main()
