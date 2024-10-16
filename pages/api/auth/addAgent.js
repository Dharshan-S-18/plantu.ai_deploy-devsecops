// pages/api/auth/addAgent.js
 
import dbConnect from '../../../utils/dbConnect';
import OrgAccount from '../../../models/orgAccount';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import path from 'path';
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
 
  let { agentName, agentEmail, accountId, orgName, subdomain, resetPassword, portNumber } = req.body; // Added resetPassword
  await dbConnect();
 
  try {
    const existingAgent = await OrgAccount.findOne({ email: agentEmail, subdomainName: subdomain });
 console.log(existingAgent)
    if (existingAgent && !resetPassword) {
      // If an agent exists and it's not a reset request, return conflict error
      return res.status(409).json({ error: 'User already exists with provided email ID.' });
    }
 
    // Create a token that expires in 30 minutes
    const token = jwt.sign({ email: agentEmail, subdomainName: subdomain }, process.env.JWT_SECRET, { expiresIn: '30m' });
 
    if (resetPassword) {
      // If it's a reset request, update the existing agent's token
      existingAgent.passwordToken = token;
      await existingAgent.save(); // Save the token for the existing agent

      agentName = existingAgent.name;
      orgName = existingAgent.organizationName;

      // Only proceed to send the email if save operation was successful
      sendEmail(agentName, agentEmail, orgName, token, subdomain, portNumber, resetPassword);
    } else {
      // For a new agent, save new agent information
      const newAgent = await OrgAccount.create({
        name: agentName, 
        email: agentEmail, 
        accountId, 
        organizationName: orgName, 
        passwordToken: token, 
        subdomainName: subdomain,
        role: 'User'
      });

      // Only proceed to send the email if the new agent creation was successful
      sendEmail(agentName, agentEmail, orgName, token, subdomain, portNumber);
    }

    res.status(200).json({ message: 'Agent invited or password reset successfully. Email sent to agent.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create or reset agent password.' });
  }
}

// Helper function to send the email after successful agent save
const sendEmail = async (agentName, agentEmail, orgName, token, subdomain, portNumber, resetPassword) => {
  // Setup the nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Construct the login URL with the subdomain
  const loginUrl = process.env.NODE_ENV === 'development' ? `http://${subdomain}.${process.env.NEXT_PUBLIC_URL}:${portNumber}` : `https://${subdomain}.${process.env.NEXT_PUBLIC_URL}`;

  const passwordSetupURL = `${loginUrl}/setPassword?token=${token}`;
  console.log(passwordSetupURL);

  // Email message content based on first-time or reset
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: agentEmail,
    subject: resetPassword
        ? 'Reset Your Password for Plantu.AI'
        : 'Invitation to Join Plantu.AI',
    html: resetPassword
        ? `<p>Dear ${agentName},</p>
           <p>We have received a request to reset the password for your Plantu.AI account associated with the organization <strong>${orgName}</strong>.</p>
           <p>To proceed, please click the button below to set a new password:</p>
           <p><a href="${passwordSetupURL}" style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;">Reset Your Password</a></p>
           <p>This link will expire in 30 minutes for security reasons. If you did not request a password reset, please ignore this email or contact our support team immediately at [support_email@example.com].</p>
           <p>Thank you for using Plantu.AI.</p>
           <p>Best regards,<br>The Plantu.AI Team</p>
            <p>
           <img src="cid:plantulogo" alt="Plantu Logo" style="max-height: 50px;"/>
           </p>`
        : `<p>Dear ${agentName},</p>
           <p>We are excited to invite you to join the organization <strong>${orgName}</strong> on Plantu.AI as an agent.</p>
           <p>To accept this invitation and activate your account, please click the button below to set up your password:</p>
           <p><a href="${passwordSetupURL}" style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;">Set Up Your Password</a></p>
           <p>Please note that this link will expire in 30 minutes. If you have any questions or need assistance, feel free to reach out to our support team at [support_email@example.com].</p>
           <p>We look forward to having you on our platform!</p>
           <p>Welcome aboard,<br>The Plantu.AI Team</p>
            <p>
           <img src="cid:plantulogo" alt="Plantu Logo" style="max-height: 50px;"/>
           </p>
           <hr />
           <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
           <p style="font-size: 12px; color: #888;">If the button above doesn't work, please copy and paste the following URL into your web browser: <a href="${loginUrl}">${loginUrl}</a></p>
           `,
           attachments: [{
               filename: 'plantuLogo.png',
               path: path.join(process.cwd(), 'pages/post/image/plantuLogo.png'), // Correct path using path.join
               cid: 'plantulogo'
           }]
};

  // Send the email
  await transporter.sendMail(mailOptions);
};