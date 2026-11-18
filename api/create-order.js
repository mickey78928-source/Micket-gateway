export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { amount, userId } = req.body;
  const API_KEY = process.env.TRUST_GATEWAY_API_KEY;

  try {
    const response = await fetch('https://trustgateway.in/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify({ amount: String(amount), note: `Topup for ${userId}` })
    });
    const data = await response.json();
    res.status(200).json({ success: true, url: data.checkout_url, orderId: data.order_id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
