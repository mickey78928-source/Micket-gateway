import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { orderId, userId, amount } = req.query;
  const API_KEY = process.env.TRUST_GATEWAY_API_KEY;

  try {
    const response = await fetch(`https://trustgateway.in/api/v1/orders/${orderId}`, {
      headers: { 'X-API-Key': API_KEY }
    });
    const data = await response.json();

    if (data.status === 'paid' || data.paid === true) {
      if (!initializeApp.apps.length) {
        initializeApp({ credential: cert(serviceAccount) });
      }
      const db = getFirestore();
      
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        const currentBalance = userDoc.data().balance || 0;
        await userRef.update({ balance: currentBalance + Number(amount) });
        res.status(200).json({ success: true, message: 'Balance added successfully!' });
      } else {
        res.status(404).json({ success: false, error: 'User not found' });
      }
    } else {
      res.status(400).json({ success: false, error: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
