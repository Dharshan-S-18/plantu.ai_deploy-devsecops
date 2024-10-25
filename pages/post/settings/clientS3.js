import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const SetupS3BucketPage = () => {
  const [formData, setFormData] = useState({
    accountId: "",
    subdomain: "",
    bucketName: "",
    accessKeyId: "",
    secretAccessKeyId: "",
    region: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/ClientS3Credential", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: formData.accountId,
          subdomain: formData.subdomain,
          bucketName: formData.bucketName,
          accessKeyId: formData.accessKeyId,
          secretAccessKeyId: formData.secretAccessKeyId,
          region: formData.region,
        }),
      });

      if (response.ok) {
        console.log("S3 Bucket credentials saved successfully");
      } else {
        const data = await response.json();
        console.log("Error:", data.message);
      }
    } catch (error) {
      console.error("Error saving credentials:", error);
    }
  };

  useEffect(() => {
    const hostname = window.location.hostname;
    const extractedSubdomain = hostname.split(".")[0];
    const accountId = sessionStorage.getItem("accountId");

    setFormData({
      accountId: accountId || "",
      subdomain: extractedSubdomain || "",
    });
  }, []);

  return (
    <Box>
      {/* Page Title */}
      <Typography variant="h5" sx={{ mb: 3 }}>
        Setup Your Own S3 Bucket For File Storage
      </Typography>

      {/* Accordion for Create Bucket */}
      <Accordion sx={{ width: "100%" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          Steps for Create Bucket
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Detailed steps for creating an S3 bucket&nbsp;
            <a
              href="https://nikqiktech-my.sharepoint.com/:w:/g/personal/jayesh_kulkarni_nikqik_com/EdALkVzTvU1Kse6fxzBuXV4Bc0Wllpha4vPQ1PlPzVFDYA?e=g8CoLZ"
              target="_blank" //it opens link in new tab
              rel="noopener noreferrer"
            >
              click here
            </a>
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Accordion for Credentials Setup */}
      <Accordion sx={{ width: "100%" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="setup-s3-content"
          id="setup-s3-header"
        >
          Give Credential To Setup
        </AccordionSummary>
        <AccordionDetails>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <TextField
              name="AccountId"
              value={formData.accountId}
              onChange={handleChange}
              required
              disabled // This makes the field read-only
            />
            <TextField
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              required
              disabled // This makes the field read-only
            />
            <TextField
              label="Bucket Name"
              name="bucketName"
              value={formData.bucketName}
              onChange={handleChange}
              required
            />
            <TextField
              label="Access Key"
              name="accessKeyId"
              value={formData.accessKeyId}
              onChange={handleChange}
              required
            />
            <TextField
              label="Secret Key"
              name="secretAccessKeyId"
              value={formData.secretAccessKeyId}
              onChange={handleChange}
              required
            />
            <TextField
              label="Region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
            />

            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default SetupS3BucketPage;
