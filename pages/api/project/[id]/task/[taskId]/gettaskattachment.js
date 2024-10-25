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
  const { id, taskId } = req.query;
  console.log(id);
  console.log(taskId);

  if (req.method === "GET") {
    try {
      const listParams = {
        Bucket: process.env.BUCKET_NAME,
        Prefix: `projects/${id}/tasks/${taskId}/`,
        Delimiter: "/", // This prevents listing files in deeper subfolders
      };

      const data = await s3Client.send(new ListObjectsV2Command(listParams));

      if (!data.Contents || data.Contents.length === 0) {
        return res.status(200).json([]); // No files found
      }

      // Map the relevant files to their URLs
      const files = data.Contents.map((file) => ({
        key: file.Key,
        url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/projects/${id}/tasks/${taskId}/${file.Key}`,
      }));

      return res.status(200).json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      return res.status(500).json({
        error: "Error fetching files",
      });
    }
  } else {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }
}
