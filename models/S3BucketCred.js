import mongoose from "mongoose";

const S3BucketCredentialSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    unique: true,
  },
  subdomain: {
    type: String,
    required: true,
  },
  bucketName: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  accessKeyId: {
    type: String,
    required: true,
  },
  secretAccessKeyId: {
    type: String,
    required: true,
  },
});

export default mongoose.models.S3BucketCred ||
  mongoose.model("S3BucketCred", S3BucketCredentialSchema);
