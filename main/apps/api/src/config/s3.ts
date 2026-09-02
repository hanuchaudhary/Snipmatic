import { S3Client } from "bun";

export const s3Client = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET_NAME,
  region: process.env.AWS_REGION,
});

export abstract class S3Service {
  static async upload({
    filename,
    filepath,
  }: {
    filename: string;
    filepath: string;
  }) {}

  static async presignedUrl({
    filename,
    filepath = `raw/${filename}`,
  }: {
    filename: string;
    filepath?: string;
  }) {
    const uploadUrl = s3Client.presign(filepath, {
      method: "PUT",
      expiresIn: 3600,
      type: filename.split(".").pop()?.toLowerCase() === "mp4" ? "video/*" : "image/*",
    });

    return uploadUrl;
  }
}
