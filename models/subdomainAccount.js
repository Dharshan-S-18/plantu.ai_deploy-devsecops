import mongoose from 'mongoose';
 
const SubdomainSchema = new mongoose.Schema({
  accountId: { type: String, required: true, unique: true },
  subdomainName: { type: String, required: true, unique: true },
});
 
export default mongoose.models.SubdomainAccount || mongoose.model('SubdomainAccount', SubdomainSchema);