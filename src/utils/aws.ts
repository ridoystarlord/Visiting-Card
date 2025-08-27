import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_AWS_ACCESS_KEY,
    secretAccessKey: process.env.S3_AWS_SECRET_ACCESS,
  },
});

export const getObjectURL = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
};

export const putObjectURL = async (
  extension: string,
  contentType: string,
  folderName: string,
  userId: string,
) => {
  const key = `${folderName}/${userId}-${Date.now()}.${extension}`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${key}`,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command);
  return { url, key: `${key}` };
};
