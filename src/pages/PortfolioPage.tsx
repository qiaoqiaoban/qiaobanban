import { useAccount ,usePublicClient,useSendTransaction,useWalletClient  } from 'wagmi';
import { useWriteContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePortfolioSummary, usePositionsWithPnL } from '../hooks/usePositions';
import { formatTokenAmount, formatPercentage, formatTimeAgo, getTokenSymbol, getTokenDecimals } from '../lib/utils';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Target, Award, Clock } from 'lucide-react';
import { deposite,redeem } from '@/core/contract';

const PortfolioPage = () => {
  const { isConnected,address } = useAccount();
  const publicClient = usePublicClient()
  const { sendTransactionAsync ,sendTransaction} = useSendTransaction()
  const { writeContractAsync } = useWriteContract()
  const { data: walletClient } = useWalletClient()
  const { summary, isLoading } = usePortfolioSummary();
  const { positions } = usePositionsWithPnL();
  const deposit = async()=>
  {
     await deposite(0,1e18.toString(),address.toString(),publicClient,writeContractAsync)
  }
  const withdrw = async()=>
  {
    await redeem(0,1e17.toString(),address.toString(),publicClient,writeContractAsync)
  }
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-accent/50">
          <CardContent className="text-center py-12">
            <PieChart className="h-16 w-16 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-text-secondary text-lg">
              Connect your Ethereum wallet to view your portfolio overview
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-surface-elevated rounded w-64"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="py-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-surface-elevated rounded w-20"></div>
                    <div className="h-8 bg-surface-elevated rounded w-32"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const recentPositions = positions
    .sort((a, b) => Number(b.openTime - a.openTime))
    .slice(0, 5);
  
  const profitablePositions = positions.filter(p => p.pnl > 0).length;
  const winRate = positions.length > 0 ? (profitablePositions / positions.length) * 100 : 0;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Portfolio Overview</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Track your trading performance and portfolio statistics
        </p>
      </div>
      
      {/* Portfolio Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total Collateral</p>
                <p className="text-2xl font-bold text-primary-300">
                  {formatTokenAmount(summary.totalCollateral, 18, 4)} ETH
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/20 to-accent/10 border-accent/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total Investment</p>
                <p className="text-2xl font-bold text-accent">
                  {formatTokenAmount(summary.totalInvestment, 18, 4)} ETH
                </p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-br ${
          summary.totalPnL >= 0 
            ? 'from-success/20 to-success/10 border-success/30'
            : 'from-error/20 to-error/10 border-error/30'
        }`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total P&L</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${
                    summary.totalPnL >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {summary.totalPnL >= 0 ? '+' : ''}
                    {formatTokenAmount(summary.totalPnL, 18, 4)} ETH
                  </p>
                </div>
                <p className={`text-sm ${
                  summary.totalPnL >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {formatPercentage(summary.totalPnLPercentage)}
                </p>
              </div>
              {summary.totalPnL >= 0 ? (
                <TrendingUp className="h-8 w-8 text-success" />
              ) : (
                <TrendingDown className="h-8 w-8 text-error" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 border-blue-500/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Win Rate</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatPercentage(winRate)}
                </p>
                <p className="text-sm text-text-secondary">
                  {profitablePositions}/{positions.length} trades
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Position Statistics */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Position Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-accent" />
              Position Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total Positions</span>
                <span className="font-semibold text-xl">{summary.totalPositions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Open Positions</span>
                <span className="font-semibold text-xl text-success">{summary.openPositions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Closed Positions</span>
                <span className="font-semibold text-xl text-text-secondary">
                  {summary.totalPositions - summary.openPositions}
                </span>
              </div>
            </div>
            
            {/* Visual representation */}
            <div className="bg-surface-elevated rounded-lg p-4 mt-4">
              <div className="w-full bg-border rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: summary.totalPositions > 0 
                      ? `${(summary.openPositions / summary.totalPositions) * 100}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-text-secondary mt-2">
                <span>Closed</span>
                <span>Open</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Token Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-6 w-6 text-accent" />
              Token Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {positions.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No positions yet</p>
              ) : (
                <>
                  {[0, 1, 2].map((tokenType) => {
                    const tokenPositions = positions.filter(p => p.types === tokenType);
                    const percentage = positions.length > 0 ? (tokenPositions.length / positions.length) * 100 : 0;
                    return (
                      <div key={tokenType} className="flex justify-between items-center">
                        <span className="text-text-secondary">{getTokenSymbol(tokenType)}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tokenPositions.length}</span>
                          <span className="text-sm text-text-secondary">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-accent" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Best Position</span>
                <span className="font-medium text-success">
                  {positions.length > 0 
                    ? `+${formatTokenAmount(
                        positions.reduce((max, p) => p.pnl > max ? p.pnl : max, BigInt(0)),
                        18, 
                        4
                      )} ETH`
                    : '0 ETH'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Worst Position</span>
                <span className="font-medium text-error">
                  {positions.length > 0 
                    ? `${formatTokenAmount(
                        positions.reduce((min, p) => p.pnl < min ? p.pnl : min, BigInt(0)),
                        18, 
                        4
                      )} ETH`
                    : '0 ETH'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Avg. Position Size</span>
                <span className="font-medium">
                  {positions.length > 0 
                    ? `${formatTokenAmount(
                        summary.totalInvestment / BigInt(positions.length),
                        18, 
                        4
                      )} ETH`
                    : '0 ETH'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-accent" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPositions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">No trading activity yet</p>
              <Button onClick={deposit}>
                Debug Deposite
              </Button>

              <Button onClick={withdrw}>
                Debug Withdraw
              </Button>
            </div>
            
          ) : (
            <div className="space-y-3">
              {recentPositions.map((position) => (
                <div 
                  key={position.id.toString()}
                  className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      position.isOpen ? 'bg-success' : 'bg-text-secondary'
                    }`}></div>
                    <div>
                      <span className="font-medium">#{position.id.toString()}</span>
                      <span className="text-text-secondary ml-2">{getTokenSymbol(position.types)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      position.pnl >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {position.pnl >= 0 ? '+' : ''}
                      {formatTokenAmount(position.pnl, getTokenDecimals(position.types), 4)} {getTokenSymbol(position.types)}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {formatTimeAgo(Number(position.openTime))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioPage;