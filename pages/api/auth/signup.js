import dbConnect from '../../../utils/dbConnect';
import SubdomainAccount from '../../../models/subdomainAccount';
import OrgAccount from '../../../models/orgAccount';
import bcrypt from 'bcryptjs';
import { generateUniqueAccountId } from '../../../utils/generateUniqueAccountId';
import nodemailer from 'nodemailer';
import path from 'path';

// Create reusable transporter object for email
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// const loginUrl = process.env.NEXT_PUBLIC_URL;

// Utility function for retrying async operations
async function retryAsync(fn, retries = 2, delay = 3000) {
    let attempt = 0;
    while (attempt <= retries) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }
            attempt++;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}

const handler = async (req, res) => {
    await dbConnect(); // Ensure DB connection for each request

    if (req.method === 'GET') {
        return handleGetRequest(req, res);
    } else if (req.method === 'POST') {
        return handlePostRequest(req, res);
    } else {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
};

// Handle GET requests (Subdomain availability check)
async function handleGetRequest(req, res) {
    const { subdomain } = req.query;

    if (!subdomain) {
        return res.status(400).json({ error: 'Subdomain is required' });
    }

    try {
        const existingOrg = await SubdomainAccount.findOne({ subdomainName: subdomain });
        if (existingOrg) {
            // Subdomain exists
            return res.status(200).json({ available: false });
        } else {
            // Subdomain is available means not exists in DB
            return res.status(404).json({ available: true });
        }
    } catch (error) {
        console.error('Error checking subdomain availability:', error);
        return res.status(500).json({ error: 'Error checking subdomain availability. Please try again later.' });
    }
}

// Handle POST requests (Account creation)
async function handlePostRequest(req, res) {
    const { organisationName, name, email, password, subdomain, portNumber } = req.body;

    if (!organisationName || !name || !email || !password || !subdomain) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const accountId = await generateUniqueAccountId();

        // Save subdomain and user records
        await saveSubdomainAndUser(subdomain, accountId, organisationName, name, email, hashedPassword);

        // Send a welcome email to the new user
        await sendWelcomeEmail(name, email, subdomain, portNumber);

        res.status(201).json({ message: 'Account created successfully!' });
    } catch (error) {
        console.error('Error during account creation:', error);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
}

// Save subdomain and user details with retry logic
async function saveSubdomainAndUser(subdomain, accountId, organisationName, name, email, hashedPassword) {
    try {
        // Save subdomain account
        await retryAsync(async () => {
            const subdomainRecord = new SubdomainAccount({ accountId, subdomainName: subdomain });
            return await subdomainRecord.save();
        });

        // Save organization account
        await retryAsync(async () => {
            const userRecord = new OrgAccount({
                name,
                email,
                password: hashedPassword,
                accountId,
                organizationName: organisationName,
                role: 'Admin',
                subdomainName: subdomain,
            });
            return await userRecord.save();
        });
    } catch (error) {
        console.error('Failed to save user or subdomain:', error);

        // If saving user fails, delete the created subdomain
        await retryAsync(async () => {
            await SubdomainAccount.deleteOne({ accountId, subdomainName: subdomain });
            console.log('Deleted subdomain due to user save failure.');
        });

        throw new Error('Failed to create account. Please try again later.');
    }
}

    // Send a welcome email
    async function sendWelcomeEmail(name, email, subdomain, portNumber) {

    // Construct the login URL with the subdomain
    const loginUrl = process.env.NODE_ENV === 'development' ? `http://${subdomain}.${process.env.NEXT_PUBLIC_URL}:${portNumber}` : `https://${subdomain}.${process.env.NEXT_PUBLIC_URL}`;

    const mailOptions = {
        from: 'Plantu.AI',
        to: email,
        subject: 'Welcome to Plantu.AI!',
        text: `Hi ${name},

Welcome to Plantu.AI!

We're thrilled to have you on board. Your organization account has been successfully created.

To get started, please log in to your account using the link below:
Login URL: ${loginUrl}

If the button above doesn't work, you can copy and paste the login URL into your browser.

Thank you for choosing Planto.ai. We're here to help you streamline your projects and boost productivity.

Best regards,
The Planto.ai Team`,

        html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hi <strong>${name}</strong>,</p>
        <h2 style="color: #007bff;">Welcome to Plantu.AI!</h2>
        <p>We're thrilled to have you on board. Your organization account has been successfully created.</p>
        <p>To get started, please click the button below to log in to your account:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="
                display: inline-block;
                padding: 15px 25px;
                font-size: 18px;
                color: #ffffff;
                background-color: #28a745;
                text-decoration: none;
                border-radius: 5px;
            ">Log In to Your Account</a>
        </p>
        
        <p>Need assistance? Our support team is here to help you get the most out of Plantu.AI.</p>
        <p>Thank you for choosing Plantu.AI! We're here to help you streamline your projects and boost productivity.</p>
        <p>Best regards,<br/>The Plantu.AI Team</p>
        <p>
        <img src="cid:plantulogo" alt="Plantu Logo" style="max-height: 50px;"/>
        </p>
        <hr />
        <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
        <p style="font-size: 12px; color: #888;">If the button above doesn't work, please copy and paste the following URL into your web browser: <a href="${loginUrl}">${loginUrl}</a></p> 
    </div>`,
        attachments: [{
            filename: 'plantuLogo.png',
            path: path.join(process.cwd(), 'pages/post/image/plantuLogo.png'), 
            cid: 'plantulogo'
        }]
    };

    await retryAsync(async () => {
        await transporter.sendMail(mailOptions);
    });
}

export default handler;