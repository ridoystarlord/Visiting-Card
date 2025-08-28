# Environment Variables

The following environment variables are required for the backend to work properly:

## AWS Textract

- `S3_AWS_REGION` - AWS region for Textract
- `S3_AWS_ACCESS_KEY` - AWS access key
- `S3_AWS_SECRET_ACCESS` - AWS secret access key

## Google Vision

- `GOOGLE_VISION_API_KEY` - Google Vision API key (for demo, or use service account for production)

## Database

- `DATABASE_URL` - PostgreSQL connection string

## Example `.env` file

```
S3_AWS_REGION=us-east-1
S3_AWS_ACCESS_KEY=your_aws_access_key
S3_AWS_SECRET_ACCESS=your_aws_secret_key
GOOGLE_VISION_API_KEY=your_google_vision_api_key
DATABASE_URL=postgresql://user:password@host:port/dbname
```

Make sure to set these variables in your deployment environment or in a local `.env` file for development.
