// pages/api/project/[id]/task/[taskid]/taskattachment.js
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";
import { v4 as uuuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

//create a new S3 client
const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  const { id, taskId } = req.query;

  if (req.method === "POST") {
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("file parsing error:", err);
        return res.status(500).json({ error: "file parsing error" });
      }

      console.log("file received:", files);

      //accesing first file in the error
      const file = files.file ? files.file[0] : null;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uploadfileId = uuuidv4(); //generating unique id for the file

      const key = `projects/${id}/tasks/${taskId}/${uploadfileId}-${file.originalFilename}`;

      try {
        console.log("file filepath:", file.filepath);
        if (!file.filepath) {
          console.error("File path is undefined");
          return res.status(400).json({ error: "file path is undefined" });
        }

        const uploadParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: key,
          Body: fs.createReadStream(file.filepath),
          contextType: file.mimetype,
        };

        // upload the file into S3
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("File uploaded successfully", data);
        return res.status(200).json({
          url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`,
          uploadfileId,
        });
      } catch (error) {
        console.error("S3 upload error:", error);
        return res.status(500).json({
          error: "file upload error",
          details: error.message,
        });
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
        console.log(fileKey);

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
    return res.status(405).json({
      error: "Method not allowed",
    });
  }
}
