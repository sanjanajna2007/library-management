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
    console.log('Connected!');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.findOneAndUpdate(
      {email: 'admin@gmail.com'}, 
      {password: hashedPassword, role: 'admin'}
    );
    console.log('Done! Password reset to admin123');
    process.exit();
  })
  .catch(err => console.log(err));