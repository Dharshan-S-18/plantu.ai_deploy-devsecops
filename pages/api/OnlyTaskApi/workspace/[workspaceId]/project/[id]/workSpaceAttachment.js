//pages/api/OnlyTaskApi/workspace/[workespaceId]/project/[id]/workSpaceAttachment.js
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "../../../../../../../utils/dbConnect";
import S3BucketCred from "../../../../../../../models/S3BucketCred";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { workspaceId, id, accountId, subdomain } = req.query;

  await dbConnect();

  // Fetch client credentials from MongoDB
  const clientCredential = await S3BucketCred.findOne({
    accountId: accountId,
    subdomain: subdomain,
  });

  const s3Config = clientCredential
    ? {
        region: clientCredential.region,
        credentials: {
          accessKeyId: clientCredential.accessKeyId,
          secretAccessKey: clientCredential.secretAccessKeyId,
        },
      }
    : {
        region: process.env.REGION,
        credentials: {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
      };

  const s3Client = new S3Client(s3Config);

  if (req.method === "GET") {
    try {
      const listParams = {
        Bucket: clientCredential
          ? clientCredential.bucketName
          : process.env.BUCKET_NAME,
        Prefix: `workspace/${workspaceId}/project/${id}/attachments/`, // List only project attachments
      };

      const data = await s3Client.send(new ListObjectsV2Command(listParams));
      const files =
        data.Contents?.map((file) => ({
          key: file.Key,
          bucketName: clientCredential
            ? clientCredential.bucketName
            : process.env.BUCKET_NAME,
          region: clientCredential
            ? clientCredential.region
            : process.env.REGION,
          url: `https://${
            clientCredential
              ? clientCredential.bucketName
              : process.env.BUCKET_NAME
          }.s3.${
            clientCredential ? clientCredential.region : process.env.REGION
          }.amazonaws.com/${file.Key}`,
        })) || [];

      return res.status(200).json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      return res.status(500).json({ error: "Error fetching files" });
    }
  } else if (req.method === "POST") {
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("File parsing error:", err);
        return res.status(500).json({ error: "File parsing error" });
      }

      const file = files.file ? files.file[0] : null;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uploadfileId = uuidv4();
      const key = `workspace/${workspaceId}/project/${id}/attachments/${uploadfileId}-${file.originalFilename}`; // Save in "attachments" folder

      try {
        const uploadParams = {
          Bucket: clientCredential
            ? clientCredential.bucketName
            : process.env.BUCKET_NAME,
          Key: key,
          Body: fs.createReadStream(file.filepath),
          ContentType: file.mimetype,
        };

        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        return res.status(200).json({
          url: `https://${
            clientCredential
              ? clientCredential.bucketName
              : process.env.BUCKET_NAME
          }.s3.amazonaws.com/${key}`,
          uploadfileId,
        });
      } catch (error) {
        console.error("S3 upload error:", error);
        return res
          .status(500)
          .json({ error: "File upload error", details: error.message });
      }
    });
  } else if (req.method === "DELETE") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { fileKey } = JSON.parse(body);
        if (!fileKey) {
          return res.status(400).json({ error: "File key is required" });
        }

        const deleteParams = {
          Bucket: clientCredential
            ? clientCredential.bucketName
            : process.env.BUCKET_NAME,
          Key: fileKey,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        return res.status(200).json({ message: "File Deleted Successfully" });
      } catch (error) {
        console.error("S3 delete error:", error);
        return res
          .status(500)
          .json({ error: "File delete error", details: error.message });
      }
    });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
