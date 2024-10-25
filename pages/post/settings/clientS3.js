import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSnackClose = () => {
    setSnackbarOpen(false);
  };

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
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("S3 Bucket credentials saved successfully");
        setSnackbarMessage("AWS S3 Bucket Credential Stored successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setIsSubmitted(true); // Disable submit on success
        localStorage.setItem("isSubmitted", "true"); // Save to localStorage
      } else {
        const data = await response.json();
        console.log("Error:", data.message);
        setSnackbarMessage("Failed to save credentials!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error saving credentials:", error);
      setSnackbarMessage("Error saving credentials!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const hostname = window.location.hostname;
    const extractedSubdomain = hostname.split(".")[0];
    const accountId = sessionStorage.getItem("accountId");

    setFormData((prevData) => ({
      ...prevData,
      accountId: accountId || "",
      subdomain: extractedSubdomain || "",
    }));

    // Check if form was previously submitted
    const wasSubmitted = localStorage.getItem("isSubmitted") === "true";
    setIsSubmitted(wasSubmitted);
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Setup Your Own S3 Bucket For File Storage
      </Typography>

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
              target="_blank"
              rel="noopener noreferrer"
            >
              click here
            </a>
          </Typography>
        </AccordionDetails>
      </Accordion>

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
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              required
              disabled
            />
            <TextField
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              required
              disabled
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

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitted}
            >
              Submit
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackClose}
        autoHideDuration={3000}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SetupS3BucketPage;
