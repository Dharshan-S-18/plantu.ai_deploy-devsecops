import dbConnect from '../../../utils/dbConnect';
import OrgAccount from '../../../models/orgAccount';
 
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
 
  const { accountId, subdomain } = req.query;
 
  if (!accountId || !subdomain) {
    return res.status(400).json({ error: 'Account ID and Subdomain is required' });
  }
 
  await dbConnect();
 
  try {
    // Fetch users from the database where accountId matches
    const agents = await OrgAccount.find({ accountId, subdomainName: subdomain }).select('name email phone role'); // You can add other fields you want to select
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching agents' });
  }
}