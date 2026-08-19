import os
import boto3

s3_client = boto3.client('s3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

def upload_file(file_path, bucket_name, key):
    try:
        s3_client.upload_file(file_path, bucket_name, key)
    except Exception as e:
        print(f"Error uploading file: {e}")
        raise e

def download_file(bucket_name, key, file_path):
    try:
        s3_client.download_file(bucket_name, key, file_path)
    except Exception as e:
        print(f"Error downloading file: {e}")
        raise e