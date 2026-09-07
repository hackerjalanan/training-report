const axios = require('axios');

const verifyCaptcha = async (captchaToken) => {
  // Lewatkan verifikasi saat development (return true, bukan next())
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: skipping captcha verification');
    return true;
  }

  // Validasi token
  if (!captchaToken) {
    console.error('Captcha token is missing');
    return false;
  }

  // Prepare form data
  const formData = new URLSearchParams();
  formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
  formData.append('response', captchaToken);

  try {
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = response.data;
    
    console.log('Turnstile verification result:', result);

    // Return boolean berdasarkan hasil verifikasi
    if (result.success) {
      return true;
    } else {
      console.error('Captcha verification failed:', result['error-codes'] || []);
      return false;
    }

  } catch (error) {
    console.error('Captcha verification error:', error.message);
    return false; // Return false jika terjadi error
  }
};

module.exports = {
  verifyCaptcha,
};