import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useContractOwner, useWithdrawFees } from '../hooks/useContract';
import { usePositionsWithPnL } from '../hooks/usePositions';
import { formatTokenAmount, formatAddress } from '../lib/utils';
import { Shield, DollarSign, Users, TrendingUp, AlertCircle, Download } from 'lucide-react';

const AdminPage = () => {
  const { address, isConnected } = useAccount();
  const { data: contractOwner } = useContractOwner();
  const { positions } = usePositionsWithPnL();
  const { withdrawFees, isPending, isConfirming, isSuccess, error } = useWithdrawFees();
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Check if current user is admin
  const isAdmin = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();
  
  // Mock data for demonstration - in real app, this would come from contract
  const [adminStats] = useState({
    totalFeesCollected: BigInt('2500000000000000000'), // 2.5 ETH
    totalTradingVolume: BigInt('50000000000000000000'), // 50 ETH
    totalUsers: 125,
    averagePositionSize: BigInt('1500000000000000000'), // 1.5 ETH
  });
  
  const handleWithdrawFees = () => {
    setShowConfirmModal(true);
  };
  
  const confirmWithdrawFees = () => {
    withdrawFees();
    setShowConfirmModal(false);
  };
  
  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success('Fees withdrawn successfully!');
    }
  }, [isSuccess]);
  
  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(`Failed to withdraw fees: ${error.message}`);
    }
  }, [error]);
  
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-accent/50">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Admin Access Required</h3>
            <p className="text-text-secondary text-lg">
              Connect your wallet to access the admin panel
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-error/50">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-error mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Access Denied</h3>
            <p className="text-text-secondary text-lg mb-4">
              Only the contract owner can access this admin panel
            </p>
            <div className="text-sm text-text-secondary space-y-1">
              <p>Your address: {formatAddress(address || '')}</p>
              <p>Owner address: {formatAddress(contractOwner || '')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const totalPositions = positions.length;
  const openPositions = positions.filter(p => p.isOpen).length;
  const closedPositions = totalPositions - openPositions;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Monitor platform metrics and manage protocol fees
        </p>
        <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
          <Shield className="h-4 w-4" />
          Contract Owner: {formatAddress(contractOwner || '')}
        </div>
      </div>
      
      {/* Admin Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-accent/20 to-accent/10 border-accent/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total Fees Collected</p>
                <p className="text-2xl font-bold text-accent">
                  {formatTokenAmount(adminStats.totalFeesCollected, 18, 4)} ETH
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Trading Volume</p>
                <p className="text-2xl font-bold text-primary-300">
                  {formatTokenAmount(adminStats.totalTradingVolume, 18, 2)} ETH
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-success/20 to-success/10 border-success/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-success">{adminStats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 border-blue-500/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Avg Position Size</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatTokenAmount(adminStats.averagePositionSize, 18, 4)} ETH
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Fee Management & Platform Stats */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Fee Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-accent" />
              Fee Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-surface-elevated rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Available Fees:</span>
                <span className="text-2xl font-bold text-accent">
                  {formatTokenAmount(adminStats.totalFeesCollected, 18, 6)} ETH
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Fee Rate:</span>
                <span className="font-medium">0.3%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Last Withdrawal:</span>
                <span className="font-medium">2 weeks ago</span>
              </div>
            </div>
            
            <Button
              onClick={handleWithdrawFees}
              loading={isPending || isConfirming}
              className="w-full"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Withdraw All Fees
            </Button>
            
            <div className="text-xs text-text-secondary bg-surface-elevated rounded p-3">
              <strong>Note:</strong> Withdrawing fees will transfer all collected protocol fees to the contract owner's address. This action cannot be undone.
            </div>
          </CardContent>
        </Card>
        
        {/* Platform Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-accent" />
              Platform Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total Positions:</span>
                <span className="font-semibold text-xl">{totalPositions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Open Positions:</span>
                <span className="font-semibold text-xl text-success">{openPositions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Closed Positions:</span>
                <span className="font-semibold text-xl text-text-secondary">{closedPositions}</span>
              </div>
            </div>
            
            <div className="bg-surface-elevated rounded-lg p-4 mt-4">
              <h4 className="font-semibold mb-2">Position Distribution</h4>
              <div className="space-y-2">
                {['ETH', 'USDT', 'USDC'].map((token, index) => {
                  const tokenPositions = positions.filter(p => p.types === index).length;
                  const percentage = totalPositions > 0 ? (tokenPositions / totalPositions) * 100 : 0;
                  return (
                    <div key={token} className="flex justify-between items-center">
                      <span className="text-text-secondary">{token}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tokenPositions}</span>
                        <span className="text-sm text-text-secondary">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="text-xs text-text-secondary">
              Last updated: {new Date().toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Withdraw Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-warning">Confirm Fee Withdrawal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-text-secondary">
                  You are about to withdraw all collected protocol fees:
                </p>
                <div className="bg-surface-elevated rounded-lg p-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-accent">
                      {formatTokenAmount(adminStats.totalFeesCollected, 18, 6)} ETH
                    </span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">
                  This will transfer the fees to your wallet address: {formatAddress(address || '')}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmWithdrawFees}
                  loading={isPending || isConfirming}
                  className="flex-1"
                >
                  Confirm Withdrawal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPage;