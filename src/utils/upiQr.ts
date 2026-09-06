import QRCode from 'qrcode';

export interface UpiParams {
  upiId: string;
  payeeName: string;
  amount: number;
  note?: string;
}

/**
 * Builds standard Indian UPI Intent URI:
 * upi://pay?pa=address@bank&pn=Payee%20Name&am=99.00&cu=INR&tn=Note
 */
export function buildUpiUri({ upiId, payeeName, amount, note }: UpiParams): string {
  const cleanUpi = upiId.trim();
  const cleanName = payeeName.trim() || 'MTCC BillPro Admin';
  const cleanNote = (note || 'MTCC Registration Fee').trim();
  const formattedAmount = Number(amount || 99).toFixed(2);

  const params = new URLSearchParams();
  params.set('pa', cleanUpi);
  params.set('pn', cleanName);
  params.set('am', formattedAmount);
  params.set('cu', 'INR');
  if (cleanNote) {
    params.set('tn', cleanNote);
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates a PNG Data URL for a given UPI URI or string.
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  if (!text || !text.trim()) {
    return '';
  }

  try {
    const dataUrl = await QRCode.toDataURL(text.trim(), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: {
        dark: '#020617', // slate-950
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code with QRCode library, falling back to API', err);
    // Fallback if canvas is unavailable
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=4&data=${encodeURIComponent(text.trim())}`;
  }
}
