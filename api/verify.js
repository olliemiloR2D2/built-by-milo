const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PDF_MAP = {
  'en':      '/downloads/built-by-milo-en.pdf',
  'fr':      '/downloads/built-by-milo-fr.pdf',
  'de':      '/downloads/built-by-milo-de.pdf',
  'es':      '/downloads/built-by-milo-es.pdf',
  'zh-hans': '/downloads/built-by-milo-zh-hans.pdf',
  'zh-hant': '/downloads/built-by-milo-zh-hant.pdf',
};

const LANG_LABELS = {
  'en':      'English',
  'fr':      'French',
  'de':      'German',
  'es':      'Spanish',
  'zh-hans': 'Simplified Chinese',
  'zh-hant': 'Traditional Chinese',
};

module.exports = async function handler(req, res) {
  // CORS for same-origin only
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed' });
    }

    const lang = session.client_reference_id || 'en';
    const downloadUrl = PDF_MAP[lang] || PDF_MAP['en'];
    const langLabel = LANG_LABELS[lang] || 'English';

    return res.status(200).json({
      success: true,
      lang,
      langLabel,
      downloadUrl,
      email: session.customer_details?.email || null,
    });
  } catch (err) {
    console.error('Stripe verification error:', err.message);
    return res.status(400).json({ error: 'Invalid or expired session' });
  }
};
