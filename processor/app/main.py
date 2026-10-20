import argparse
import json
import tempfile
from pathlib import Path

from dotenv import load_dotenv

from app.runner import run_pipeline
from app.utils.types import JobPayload


def main():
    load_dotenv()
    parser = argparse.ArgumentParser(description="Run a processor payload locally")
    parser.add_argument("payload", type=Path, help="Path to a JSON processor payload")
    args = parser.parse_args()

    payload = JobPayload.model_validate(
        json.loads(args.payload.read_text(encoding="utf-8"))
    )
    with tempfile.TemporaryDirectory(prefix=f"clip-{payload.projectId}-") as workspace:
        result = run_pipeline(payload, workspace)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
