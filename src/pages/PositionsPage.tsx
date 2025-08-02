import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

import { usePublicClient,useSendTransaction,useWalletClient  } from 'wagmi';
import { useWriteContract } from 'wagmi'

import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePositionsWithPnL } from '../hooks/usePositions';
import { useClosePosition } from '../hooks/useContract';
import { formatTokenAmount, formatPercentage, formatTimeAgo, getTokenSymbol, getTokenDecimals } from '../lib/utils';
import { PositionWithPnL } from '../types/contract';
import { TrendingUp, TrendingDown, Clock, DollarSign, Filter, X } from 'lucide-react';
import { getUserPositions } from '@/core/contract';

type FilterType = 'all' | 'open' | 'closed';
type SortType = 'newest' | 'oldest' | 'pnl_desc' | 'pnl_asc';

const PositionsPage = () => {

    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient()
    const { sendTransactionAsync ,sendTransaction} = useSendTransaction()
    const { writeContractAsync } = useWriteContract()
    const { data: walletClient } = useWalletClient()

  const { positions, openPositions, closedPositions, isLoading } = usePositionsWithPnL();
  const { closePosition, isPending, isConfirming, isSuccess, error } = useClosePosition();
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [selectedPosition, setSelectedPosition] = useState<PositionWithPnL | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  
  // Filter and sort positions
  const filteredPositions = positions.filter(position => {
    if (filter === 'open') return position.isOpen;
    if (filter === 'closed') return !position.isOpen;
    return true;
  });
  
  const sortedPositions = [...filteredPositions].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return Number(b.openTime - a.openTime);
      case 'oldest':
        return Number(a.openTime - b.openTime);
      case 'pnl_desc':
        return Number(b.pnl - a.pnl);
      case 'pnl_asc':
        return Number(a.pnl - b.pnl);
      default:
        return 0;
    }
  });
  
  const handleClosePosition = (position: PositionWithPnL) => {
    setSelectedPosition(position);
    setShowCloseModal(true);
  };
  
  const confirmClosePosition = () => {
    if (selectedPosition) {
      closePosition(selectedPosition.id);
      setShowCloseModal(false);
      setSelectedPosition(null);
    }
  };
  
    const init = async()=>
    {
      const pos = await getUserPositions(address,publicClient);
      console.log(pos)
    }
    
  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success('Position closed successfully!');
    }
    init()
  }, [isSuccess]);
  
  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(`Failed to close position: ${error.message}`);
    }
  }, [error]);
  
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-accent/50">
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-text-secondary text-lg">
              Connect your Ethereum wallet to view your trading positions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">My Positions</h1>
          <p className="text-text-secondary text-lg mt-2">
            Monitor and manage your leverage trading positions
          </p>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-accent">{positions.length}</div>
            <div className="text-sm text-text-secondary">Total</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-success">{openPositions.length}</div>
            <div className="text-sm text-text-secondary">Open</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-text-secondary">{closedPositions.length}</div>
            <div className="text-sm text-text-secondary">Closed</div>
          </div>
        </div>
      </div>
      
      {/* Filters and Sort */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Filter className="h-5 w-5 text-text-secondary mt-1" />
              {(['all', 'open', 'closed'] as FilterType[]).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === filterType
                      ? 'bg-primary text-white'
                      : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="input text-sm w-auto min-w-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="pnl_desc">Highest P&L</option>
              <option value="pnl_asc">Lowest P&L</option>
            </select>
          </div>
        </CardContent>
      </Card>
      
      {/* Positions List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-surface-elevated rounded w-20"></div>
                    <div className="h-3 bg-surface-elevated rounded w-32"></div>
                  </div>
                  <div className="h-8 bg-surface-elevated rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedPositions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Positions Found</h3>
            <p className="text-text-secondary mb-4">
              {filter === 'all' 
                ? "You haven't opened any positions yet."
                : `No ${filter} positions found.`
              }
            </p>
            <Button onClick={() => window.location.href = '/trade'}>
              Start Trading
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedPositions.map((position) => (
            <PositionCard
              key={position.id.toString()}
              position={position}
              onClose={() => handleClosePosition(position)}
              isClosing={isPending || isConfirming}
            />
          ))}
        </div>
      )}
      
      {/* Close Position Modal */}
      {showCloseModal && selectedPosition && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Close Position
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Position ID:</span>
                  <span className="font-medium">#{selectedPosition.id.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Token:</span>
                  <span className="font-medium">{getTokenSymbol(selectedPosition.types)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Investment:</span>
                  <span className="font-medium">
                    {formatTokenAmount(selectedPosition.investAmount, getTokenDecimals(selectedPosition.types), 4)} {getTokenSymbol(selectedPosition.types)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Current P&L:</span>
                  <span className={`font-medium ${
                    selectedPosition.pnl >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {selectedPosition.pnl >= 0 ? '+' : ''}
                    {formatTokenAmount(selectedPosition.pnl, getTokenDecimals(selectedPosition.types), 4)} {getTokenSymbol(selectedPosition.types)}
                    ({formatPercentage(selectedPosition.pnlPercentage)})
                  </span>
                </div>
              </div>
              
              <div className="bg-surface-elevated rounded-lg p-3 text-sm text-text-secondary">
                Closing this position will realize your current P&L and return your collateral plus/minus gains/losses.
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmClosePosition}
                  loading={isPending || isConfirming}
                  className="flex-1"
                >
                  Close Position
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Position Card Component
interface PositionCardProps {
  position: PositionWithPnL;
  onClose: () => void;
  isClosing: boolean;
}

const PositionCard = ({ position, onClose, isClosing }: PositionCardProps) => {
  const tokenSymbol = getTokenSymbol(position.types);
  const tokenDecimals = getTokenDecimals(position.types);
  const isProfitable = position.pnl >= 0;
  
  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      position.isOpen ? 'border-l-4 border-l-success' : 'border-l-4 border-l-text-secondary opacity-75'
    }`}>
      <CardContent className="py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Position Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">#{position.id.toString()}</span>
              <span className="bg-primary text-white px-2 py-1 rounded text-sm font-medium">
                {tokenSymbol}
              </span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                position.isOpen 
                  ? 'bg-success/20 text-success'
                  : 'bg-text-secondary/20 text-text-secondary'
              }`}>
                {position.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-text-secondary block">Collateral</span>
                <span className="font-medium">
                  {formatTokenAmount(position.mortgageAmount, tokenDecimals, 4)} {tokenSymbol}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">Investment</span>
                <span className="font-medium">
                  {formatTokenAmount(position.investAmount, tokenDecimals, 4)} {tokenSymbol}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">P&L</span>
                <div className={`font-medium flex items-center gap-1 ${
                  isProfitable ? 'text-success' : 'text-error'
                }`}>
                  {isProfitable ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {isProfitable ? '+' : ''}
                  {formatTokenAmount(position.pnl, tokenDecimals, 4)} {tokenSymbol}
                  <span className="text-xs">({formatPercentage(position.pnlPercentage)})</span>
                </div>
              </div>
              <div>
                <span className="text-text-secondary block">Opened</span>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTimeAgo(Number(position.openTime))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          {position.isOpen && (
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={onClose}
                loading={isClosing}
              >
                Close Position
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionsPage;