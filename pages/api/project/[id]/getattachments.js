// pages/api/project/[id]/getattachments.js
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  const { id } = req.query;
  console.log("req", req.query);

  if (req.method === "GET") {
    try {
      const listParams = {
        Bucket: process.env.BUCKET_NAME,
        Prefix: `projects/${id}/projectAttachment/`, // Fetch only the files for this project
      };

      const data = await s3Client.send(new ListObjectsV2Command(listParams));
      // Ensure Contents exists and is an array before using map
      if (!data.Contents || !Array.isArray(data.Contents)) {
        return res.status(200).json([]); // Return empty array if no files found
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
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
