import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { QQB_PROTOCOL_ABI, CONTRACT_ADDRESS } from '../constants/contract';
import { Address } from 'viem';

// Hook for reading user positions
export function useUserPositions(address?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS as Address,
    abi: QQB_PROTOCOL_ABI,
    functionName: 'getUserPositions',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });
}

// Hook for reading a specific position
export function usePosition(positionId?: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS as Address,
    abi: QQB_PROTOCOL_ABI,
    functionName: 'positions',
    args: positionId !== undefined ? [positionId] : undefined,
    query: {
      enabled: positionId !== undefined,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });
}

// Hook for reading contract owner
export function useContractOwner() {
  return useReadContract({
    address: CONTRACT_ADDRESS as Address,
    abi: QQB_PROTOCOL_ABI,
    functionName: 'owner',
  });
}

// Hook for opening a position
export function useOpenPosition() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const openPosition = (tokenType: number, mortgage: bigint, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS as Address,
      abi: QQB_PROTOCOL_ABI,
      functionName: 'buy',
      args: [tokenType, mortgage, amount],
      value: tokenType === 0 ? mortgage : undefined, // Send ETH value if token type is ETH
    } as any);
  };

  return {
    openPosition,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Hook for closing a position
export function useClosePosition() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const closePosition = (positionId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS as Address,
      abi: QQB_PROTOCOL_ABI,
      functionName: 'close',
      args: [positionId],
    } as any);
  };

  return {
    closePosition,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Hook for withdrawing fees (admin only)
export function useWithdrawFees() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdrawFees = () => {
    writeContract({
      address: CONTRACT_ADDRESS as Address,
      abi: QQB_PROTOCOL_ABI,
      functionName: 'withdrawFees',
    } as any);
  };

  return {
    withdrawFees,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}