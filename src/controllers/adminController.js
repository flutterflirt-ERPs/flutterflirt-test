const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@flutterflirt.com').trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();

  const inputEmail = String(email).trim().toLowerCase();
  const inputPassword = String(password).trim();

  if (inputEmail !== adminEmail || inputPassword !== adminPassword) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    process.env.JWT_SECRET || 'flutterflirt_secret_key_2026',
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    message: 'Login successful',
    token,
  });
};

module.exports = {
  loginAdmin,
};
