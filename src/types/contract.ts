// TypeScript types for smart contract interactions

export interface Position {
  id: bigint;
  types: number;
  owner: string;
  mortgageAmount: bigint;
  investAmount: bigint;
  tokenAmount: bigint;
  isOpen: boolean;
  openTime: bigint;
}

export interface PositionWithPnL extends Position {
  currentValue: bigint;
  pnl: bigint;
  pnlPercentage: number;
}

export type TokenType = 0 | 1 | 2; // ETH, USDT, USDC

export interface TradeParams {
  tokenType: TokenType;
  mortgage: bigint;
  leverage: number;
  investAmount: bigint;
}

export interface PortfolioSummary {
  totalPositions: number;
  openPositions: number;
  totalCollateral: bigint;
  totalInvestment: bigint;
  totalPnL: bigint;
  totalPnLPercentage: number;
}

export interface TransactionState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: Error;
  hash?: string;
}