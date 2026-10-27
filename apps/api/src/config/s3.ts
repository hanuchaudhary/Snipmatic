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
    contentType,
    filepath = `raw/${filename}`,
  }: {
    filename: string;
    contentType?: string;
    filepath?: string;
  }) {
    const uploadUrl = s3Client.presign(filepath, {
      method: "PUT",
      expiresIn: 3600,
      type:
        contentType ??
        (filename.split(".").pop()?.toLowerCase() === "mp4"
          ? "video/mp4"
          : "application/octet-stream"),
    });

    return uploadUrl;
  }

  static downloadUrl(key: string) {
    return s3Client.presign(key, {
      method: "GET",
      expiresIn: 60 * 60,
    });
  }
}
