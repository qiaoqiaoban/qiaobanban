import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { usePublicClient,useSendTransaction,useWalletClient  } from 'wagmi';
import { useWriteContract } from 'wagmi'
import { parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useOpenPosition } from '../hooks/useContract';
import { TOKEN_TYPES, TOKEN_INFO, MAX_LEVERAGE } from '../constants/contract';
import { formatTokenAmount, parseTokenAmount, getTokenSymbol, getTokenDecimals } from '../lib/utils';
import { TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { config, getTokenAmountsOut, getUserPositions, open } from '@/core/contract';

const TradePage = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient()
  const { sendTransactionAsync ,sendTransaction} = useSendTransaction()
  const { writeContractAsync } = useWriteContract()
  const { data: walletClient } = useWalletClient()

  const [selectedToken, setSelectedToken] = useState<keyof typeof TOKEN_TYPES>('WETH');
  const [mortgageAmount, setMortgageAmount] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const tokenType = TOKEN_TYPES[selectedToken];
  const tokenInfo = TOKEN_INFO[tokenType];
  const tokenDecimals = getTokenDecimals(tokenType);
  
  // Get user's balance for selected token
  const { data: balance } = useBalance({
    address,
    // token: tokenType === TOKEN_TYPES.MON ? undefined : tokenInfo.address as `0x${string}`,
  });
  
  const { openPosition, isPending, isConfirming, isSuccess, error } = useOpenPosition();
  
  // Calculate investment amount
  const mortgageBigInt = parseTokenAmount(mortgageAmount, tokenDecimals);
  const investmentAmount = mortgageBigInt * BigInt(leverage);
  
  // Validation
  const isValidAmount = mortgageBigInt > 0;
  const hasEnoughBalance = balance ? mortgageBigInt <= balance.value : false;
  const isValidLeverage = leverage >= 1 && leverage <= MAX_LEVERAGE;
  const canOpenPosition = isConnected && isValidAmount && hasEnoughBalance && isValidLeverage;
  
  const handleOpenPosition = () => {
    if (!canOpenPosition) return;
    setShowConfirmModal(true);
  };
  
  const confirmOpenPosition =async () => {
    // openPosition(tokenType, mortgageBigInt, investmentAmount);

    // init();
    // return 0; 
    console.log(selectedToken,TOKEN_INFO[TOKEN_TYPES[selectedToken]])
    let l = leverage==1 ? 1.1 :leverage;
    await open(
      0,
      TOKEN_INFO[TOKEN_TYPES[selectedToken]].address,
      (Number(mortgageAmount)*1e18).toFixed(0),
      (Number(mortgageAmount)*Number(l)*1e18).toFixed(0),
      address,
      publicClient,
      writeContractAsync
    )
    setShowConfirmModal(false);
  };

  const init = async()=>
  {
    const out = await getTokenAmountsOut(
      config.address.tokens.wmon,
      config.address.tokens.wbtc,
      "1000000",
      publicClient
    )
    console.log(out)
  }
  
  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success('Position opened successfully!');
      setMortgageAmount('');
      setLeverage(1);
    }

  }, [isSuccess]);
  
  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(`Failed to open position: ${error.message}`);
    }
  }, [error]);
  
  const maxBalance = balance ? formatTokenAmount(balance.value, 18, 3) : '0';
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">QiaoQiaoBan Trading</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Open leveraged positions using ETH, USDT, or USDC as collateral. Maximum leverage: {MAX_LEVERAGE}x
        </p>
      </div>
      
      {!isConnected && (
        <Card className="border-accent/50">
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-text-secondary">
              Connect your Ethereum wallet to start trading with leverage
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Trading Form */}
        <Card className="space-y-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-accent" />
              Open Position
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Token</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(TOKEN_TYPES).slice(3,5).map((token) => (
                  <button
                    key={token}
                    onClick={() => setSelectedToken(token as keyof typeof TOKEN_TYPES)}
                    className={`p-3 rounded-lg border font-medium transition-all duration-200 ${
                      selectedToken === token
                        ? 'bg-primary border-primary text-white'
                        : 'bg-surface-elevated border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Collateral Amount */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Collateral Amount</label>
                <span className="text-sm text-text-secondary">
                  Balance: {maxBalance} Mon
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={mortgageAmount}
                  onChange={(e) => setMortgageAmount(e.target.value)}
                  placeholder="0.0"
                  className="input w-full pr-20"
                  step="0.000001"
                  min="0"
                />
                <div className="absolute right-3 top-3 text-text-secondary font-medium">
                  Mon
                </div>
              </div>
              {balance && (
                <button
                  onClick={() => setMortgageAmount(maxBalance)}
                  className="text-sm text-accent hover:text-accent/80 mt-1 transition-colors"
                >
                  Use Max
                </button>
              )}
            </div>
            
            {/* Leverage Selector */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium">Leverage</label>
                <span className="text-accent font-semibold">{leverage}x</span>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max={MAX_LEVERAGE}
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #E000B3 0%, #E000B3 ${(leverage - 1) / (MAX_LEVERAGE - 1) * 100}%, #2A2A2A ${(leverage - 1) / (MAX_LEVERAGE - 1) * 100}%, #2A2A2A 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>1x</span>
                  <span>5x</span>
                  <span>{MAX_LEVERAGE}x</span>
                </div>
              </div>
            </div>
            
            {/* Investment Summary */}
            <div className="bg-surface-elevated rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Collateral:</span>
                <span>{mortgageAmount || '0'} MON</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Make Long:</span>
                <span>{mortgageAmount || '0'} {selectedToken}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Leverage:</span>
                <span className="text-accent font-semibold">{leverage}x</span>
              </div>
              <div className="flex justify-between font-medium border-t border-border pt-2">
                <span>Investment Amount:</span>
                <span className="text-accent">
                  {formatTokenAmount(investmentAmount, tokenDecimals, 6)} {selectedToken}
                </span>
              </div>
            </div>
            
            {/* Validation Messages */}
            {mortgageAmount && !hasEnoughBalance && (
              <div className="flex items-center gap-2 text-error text-sm">
                <AlertTriangle className="h-4 w-4" />
                Insufficient balance
              </div>
            )}
            
            {/* Open Position Button */}
            <Button
              onClick={handleOpenPosition}
              disabled={!canOpenPosition}
              loading={isPending || isConfirming}
              className="w-full"
              size="lg"
            >
              {isPending || isConfirming ? 'Opening Position...' : 'Open Position'}
            </Button>
          </CardContent>
        </Card>
        
        {/* Information Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-6 w-6 text-accent" />
              Trading Information
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-surface-elevated rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-accent">How It Works</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Deposit collateral (ETH, USDT, or USDC)</li>
                  <li>• Choose leverage up to {MAX_LEVERAGE}x</li>
                  <li>• Your investment = collateral × leverage</li>
                  <li>• Close position anytime to realize P&L</li>
                </ul>
              </div>
              
              <div className="bg-surface-elevated rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-warning">Important Notes</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Higher leverage = higher risk</li>
                  <li>• You can lose your entire collateral</li>
                  <li>• Monitor positions regularly</li>
                  <li>• Consider market volatility</li>
                </ul>
              </div>
              
              <div className="bg-surface-elevated rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-success">Benefits</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Amplified returns on successful trades</li>
                  <li>• Multiple collateral options</li>
                  <li>• Real-time position tracking</li>
                  <li>• Instant position opening/closing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Confirm Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Token:</span>
                  <span className="font-medium">{selectedToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Collateral:</span>
                  <span className="font-medium">{mortgageAmount} Mon</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Leverage:</span>
                  <span className="font-medium text-accent">{leverage}x</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-text-secondary">Investment:</span>
                  <span className="font-medium text-accent">
                    {formatTokenAmount(investmentAmount, tokenDecimals, 6)} {selectedToken}
                  </span>
                </div>
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
                  onClick={confirmOpenPosition}
                  className="flex-1"
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TradePage;