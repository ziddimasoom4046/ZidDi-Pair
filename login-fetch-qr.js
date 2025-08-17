require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const loginAndFetchQR = async () => {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  try {
    // Login
    const loginRes = await axios.post('https://cravo.live/login', {
      email: email,
      password: password
    }, {
      withCredentials: true
    });

    const cookie = loginRes.headers['set-cookie']?.[0];
    if (!cookie) {
      throw new Error('Login failed, cookie not received.');
    }

    console.log('✅ Login successful');

    // Fetch QR
    const qrRes = await axios.get('https://cravo.live/server', {
      headers: {
        Cookie: cookie
      },
      responseType: 'arraybuffer'
    });

    fs.writeFileSync('qr.png', qrRes.data);
    console.log('✅ QR code saved as qr.png');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

loginAndFetchQR();
