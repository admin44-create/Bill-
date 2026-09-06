/**
 * Converts a numeric amount to Indian Currency Words
 * Format: "Rupees One Thousand Two Hundred Fifty Only"
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertTwoDigits(num: number): string {
  if (num < 20) {
    return ones[num];
  }
  const t = Math.floor(num / 10);
  const o = num % 10;
  return (tens[t] + (o > 0 ? ' ' + ones[o] : '')).trim();
}

function convertThreeDigits(num: number): string {
  const h = Math.floor(num / 100);
  const rest = num % 100;
  let str = '';
  if (h > 0) {
    str += ones[h] + ' Hundred';
  }
  if (rest > 0) {
    str += (str ? ' ' : '') + convertTwoDigits(rest);
  }
  return str.trim();
}

export function numberToIndianWords(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';
  if (isNaN(amount) || amount < 0) return 'Rupees Zero Only';

  const rounded = Math.round(amount * 100) / 100;
  const integerPart = Math.floor(rounded);
  const fractionalPart = Math.round((rounded - integerPart) * 100);

  let num = integerPart;
  const parts: string[] = [];

  // Crores (1,00,00,000)
  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  if (crores > 0) {
    parts.push(numberToIndianWordsWithoutPrefix(crores) + ' Crore');
  }

  // Lakhs (1,00,000)
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  if (lakhs > 0) {
    parts.push(convertTwoDigits(lakhs) + ' Lakh');
  }

  // Thousands (1,000)
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  if (thousands > 0) {
    parts.push(convertTwoDigits(thousands) + ' Thousand');
  }

  // Hundreds & rest
  if (num > 0) {
    parts.push(convertThreeDigits(num));
  }

  let result = 'Rupees ' + (parts.length > 0 ? parts.join(' ') : 'Zero');

  if (fractionalPart > 0) {
    result += ' and ' + convertTwoDigits(fractionalPart) + ' Paise';
  }

  return result + ' Only';
}

function numberToIndianWordsWithoutPrefix(amount: number): string {
  if (amount === 0) return 'Zero';
  let num = Math.floor(amount);
  const parts: string[] = [];

  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  if (crores > 0) {
    parts.push(numberToIndianWordsWithoutPrefix(crores) + ' Crore');
  }

  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  if (lakhs > 0) {
    parts.push(convertTwoDigits(lakhs) + ' Lakh');
  }

  const thousands = Math.floor(num / 1000);
  num %= 1000;
  if (thousands > 0) {
    parts.push(convertTwoDigits(thousands) + ' Thousand');
  }

  if (num > 0) {
    parts.push(convertThreeDigits(num));
  }

  return parts.join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount || 0);
}
