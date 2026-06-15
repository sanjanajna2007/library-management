const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  purchasedBooks: []
});

const User = mongoose.model('User', UserSchema);

mongoose.connect('mongodb+srv://sanjana:library123@cluster0.flpjt4h.mongodb.net/library?appName=Cluster0')
  .then(async () => {
    const user = await User.findOne({ email: 'admin@gmail.com' });
    console.log('User found:', user);
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('Password match:', isMatch);
    process.exit();
  })
  .catch(err => console.log(err));