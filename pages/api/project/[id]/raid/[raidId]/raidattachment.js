//pages/api/project/[id]/raid/[id]/raidattachment
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Config for file uploads (necessary for handling files with formidable)
export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  const { raidId, id } = req.query; // Get project ID from the URL
  console.log("req", req.query);

  if (req.method === "GET") {
    // Fetch attachments from S3
    try {
      const listParams = {
        Bucket: process.env.BUCKET_NAME,
        Prefix: `projects/${id}/raid/${raidId}/`, // Fetch only files for this project
      };

      const data = await s3Client.send(new ListObjectsV2Command(listParams));
      if (!data.Contents || data.Contents.length === 0) {
        return res.status(200).json([]); // No files found
      }
      const files = data.Contents.map((file) => ({
        key: file.Key,
        url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${file.Key}`,
      }));

      return res.status(200).json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      return res.status(500).json({ error: "Error fetching files" });
    }
  } else if (req.method === "POST") {
    // Upload an attachment to S3
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("File parsing error:", err);
        return res.status(500).json({ error: "File parsing error" });
      }

      // Log the files object to check its structure
      console.log("Files received:", files);

      const file = files.file ? files.file[0] : null; // Access the first file in the array
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uploadfileId = uuidv4(); // Generate a unique ID for the file
      const key = `projects/${id}/raid/${raidId}/${uploadfileId}-${file.originalFilename}`; // Create a unique key for the file

      try {
        const uploadParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: key,
          Body: fs.createReadStream(file.filepath),
          ContentType: file.mimetype,
        };

        // Upload the file to S3
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("File uploaded successfully:", data);
        return res.status(200).json({
          url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`,
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
    // Handle DELETE requests
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert Buffer to string
    });

    req.on("end", async () => {
      try {
        const { fileKey } = JSON.parse(body); // Parse the body to get fileKey

        if (!fileKey) {
          return res.status(400).json({ error: "File key is required" });
        }

        const deleteParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: fileKey, // The key of the file to delete
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log("File Deleted Successfully:", fileKey);
        return res.status(200).json({ message: "File Deleted Successfully" });
      } catch (error) {
        console.error("S3 delete error:", error);
        return res
          .status(500)
          .json({ error: "File delete error", details: error.message });
      }
    });
  } else {
    // Handle unsupported methods
    return res.status(405).json({ error: "Method not allowed" });
  }
}
