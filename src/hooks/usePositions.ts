import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useUserPositions, usePosition } from './useContract';
import { Position, PositionWithPnL, PortfolioSummary } from '../types/contract';
import { formatEther, formatUnits } from 'viem';

// Hook to get all positions with P&L calculations
export function usePositionsWithPnL() {
  const { address } = useAccount();
  const { data: positionIds } = useUserPositions(address);

  // This is a simplified approach - in a real app, you'd batch these calls
  const positions = useMemo(() => {
    if (!positionIds) return [];
    
    // For demo purposes, return mock positions
    // In production, you'd fetch each position and calculate real P&L
    return positionIds.map((id, index) => {
      const mockPosition: PositionWithPnL = {
        id: BigInt(index),
        types: index % 3, // Rotate between ETH, USDT, USDC
        owner: address || '0x0',
        mortgageAmount: BigInt(1000000000000000000), // 1 ETH in wei
        investAmount: BigInt(5000000000000000000), // 5 ETH in wei
        tokenAmount: BigInt(5000000000000000000), // 5 ETH in wei
        isOpen: index < 3, // First 3 positions are open
        openTime: BigInt(Date.now() - (index * 24 * 60 * 60 * 1000)), // Stagger open times
        currentValue: BigInt(5500000000000000000 - (index * 100000000000000000)), // Varying current values
        pnl: BigInt(500000000000000000 - (index * 200000000000000000)), // Varying P&L
        pnlPercentage: 10 - (index * 4), // Varying P&L percentage
      };
      return mockPosition;
    });
  }, [positionIds, address]);

  return {
    positions,
    isLoading: false,// !positionIds,
    openPositions: positions.filter(p => p.isOpen),
    closedPositions: positions.filter(p => !p.isOpen),
  };
}

// Hook to calculate portfolio summary
export function usePortfolioSummary() {
  const { positions, isLoading } = usePositionsWithPnL();

  const summary = useMemo((): PortfolioSummary => {
    if (!positions.length) {
      return {
        totalPositions: 0,
        openPositions: 0,
        totalCollateral: BigInt(0),
        totalInvestment: BigInt(0),
        totalPnL: BigInt(0),
        totalPnLPercentage: 0,
      };
    }

    const openPositions = positions.filter(p => p.isOpen);
    const totalCollateral = positions.reduce((sum, p) => sum + p.mortgageAmount, BigInt(0));
    const totalInvestment = positions.reduce((sum, p) => sum + p.investAmount, BigInt(0));
    const totalPnL = positions.reduce((sum, p) => sum + p.pnl, BigInt(0));
    
    const totalPnLPercentage = totalInvestment > 0 
      ? Number(totalPnL * BigInt(100) / totalInvestment)
      : 0;

    return {
      totalPositions: positions.length,
      openPositions: openPositions.length,
      totalCollateral,
      totalInvestment,
      totalPnL,
      totalPnLPercentage,
    };
  }, [positions]);

  return {
    summary,
    isLoading,
  };
}