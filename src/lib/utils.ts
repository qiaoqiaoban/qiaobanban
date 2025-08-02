import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther, formatUnits } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format token amounts for display
export function formatTokenAmount(amount: bigint, decimals: number = 18, digits: number = 4): string {
  if (decimals === 18) {
    return parseFloat(formatEther(amount)).toFixed(digits);
  }
  return parseFloat(formatUnits(amount, decimals)).toFixed(digits);
}

// Format currency values
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number, digits: number = 2): string {
  return `${value.toFixed(digits)}%`;
}

// Format address for display
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format time ago
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

// Parse input amount to bigint
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  try {
    if (!amount || amount === '') return BigInt(0);
    
    // Remove any non-numeric characters except decimal point
    const cleanAmount = amount.replace(/[^\d.]/g, '');
    
    // Split by decimal point
    const [whole, fraction = ''] = cleanAmount.split('.');
    
    // Pad or truncate fraction to match decimals
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    
    // Combine and convert to bigint
    const combined = (whole || '0') + paddedFraction;
    return BigInt(combined);
  } catch {
    return BigInt(0);
  }
}

// Validate ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Get token symbol from type
export function getTokenSymbol(tokenType: number): string {
  const symbols = ['ETH', 'USDT', 'USDC'];
  return symbols[tokenType] || 'UNKNOWN';
}

// Get token decimals from type
export function getTokenDecimals(tokenType: number): number {
  const decimals = [18, 6, 6]; // ETH, USDT, USDC
  return decimals[tokenType] || 18;
}

// Calculate leverage ratio
export function calculateLeverage(mortgage: bigint, investment: bigint): number {
  if (mortgage === BigInt(0)) return 0;
  return Number(investment * BigInt(100) / mortgage) / 100;
}

// Validate leverage amount
export function validateLeverage(mortgage: bigint, amount: bigint, maxLeverage: number = 10): boolean {
  if (mortgage === BigInt(0)) return false;
  const leverage = calculateLeverage(mortgage, amount);
  return leverage >= 1 && leverage <= maxLeverage;
}