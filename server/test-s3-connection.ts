// test-s3-connection.ts
import { S3Client, HeadBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

async function testS3Connection() {
  try {
    console.log(`🔍 Testing connection to bucket: ${BUCKET_NAME}`);
    
    // Test 1: Check if our specific bucket exists and is accessible
    await s3Client.send(new HeadBucketCommand({ 
      Bucket: BUCKET_NAME 
    }));
    
    console.log("✅ S3 Connection Successful!");
    console.log(`✅ Bucket "${BUCKET_NAME}" is accessible!`);
    
    // Test 2: Try to generate a pre-signed URL (simulate upload)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: "test-connection.txt",
      ContentType: "text/plain",
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 60 
    });
    
    console.log("✅ Pre-signed URL generation successful!");
    console.log("🔗 Test URL (valid for 60 seconds):", uploadUrl.substring(0, 60) + "...");
    
  } catch (error: any) {
    console.error("❌ S3 Connection Failed:", error.message);
    
    if (error.name === 'NoSuchBucket') {
      console.error(`   Bucket "${BUCKET_NAME}" does not exist`);
    } else if (error.name === 'AccessDenied') {
      console.error(`   Access denied to bucket "${BUCKET_NAME}"`);
      console.error(`   Check your IAM permissions and bucket policy`);
    }
  }
}

testS3Connection();