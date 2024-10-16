import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: {
    type: String,
    required: [true, 'Please provide a role'],
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
