// api/ClientS3Credential.js
import dbConnect from "../../utils/dbConnect";
import S3BucketCred from "../../models/S3BucketCred";
export default async function ClientCredential(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === "POST") {
    try {
      const {
        accountId,
        subdomain,
        bucketName,
        accessKeyId,
        secretAccessKeyId,
        region,
      } = req.body;

      // Ensure the correct key names are used
      const existingCredential = await S3BucketCred.findOne({
        accountId,
        subdomain,
      });
      if (existingCredential) {
        return res.status(400).json({
          message: "Credentials already exist for this account and subdomain.",
        });
      }

      // Ensure matching key names here
      const newCredential = new S3BucketCred({
        accountId,
        subdomain,
        bucketName,
        accessKeyId,
        secretAccessKeyId,
        region,
      });

      await newCredential.save();

      return res
        .status(201)
        .json({ message: "S3 Bucket credentials saved successfully!" });
    } catch (error) {
      console.error("Error saving client credentials:", error);
      return res
        .status(500)
        .json({ message: "Server error. Please try again." });
    }
  } else if (method === "GET") {
    try {
      const { accountId, subdomain } = req.query;
      const ClientCredentialData = await S3BucketCred.findOne({
        accountId,
        subdomain,
      });
      if (!ClientCredentialData) {
        console.log("No credential found for accountId:", accountId);
        return res.status(404).json({ message: "No Credential Found." });
      }
      return res.status(200).json({
        accessKeyId: ClientCredentialData.accessKeyId,
        secretAccessKeyId: ClientCredentialData.secretAccessKeyId,
        region: ClientCredentialData.region,
        bucketName: ClientCredentialData.bucketName,
      });
    } catch (error) {
      console.error("Error fetching client AWS credential:", error);
      return res
        .status(500)
        .json({ message: "Server error. Please try again." });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed." });
  }
}
