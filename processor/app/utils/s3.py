import mimetypes
import os
from pathlib import Path

import boto3


class S3:
    def __init__(self):
        self.bucket_name = os.environ["S3_BUCKET_NAME"]
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
            region_name=os.environ.get("AWS_REGION"),
        )

    def upload_file(self, file_path: str, key: str):
        content_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"
        self.s3_client.upload_file(
            file_path,
            self.bucket_name,
            key,
            ExtraArgs={"ContentType": content_type},
        )

    def download_file(self, key: str, file_path: str):
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)
        self.s3_client.download_file(self.bucket_name, key, file_path)
