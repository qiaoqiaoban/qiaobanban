// Smart Contract Constants and ABI
export const CONTRACT_ADDRESS = '0x0'; // Placeholder address

export const TOKEN_TYPES = {
  MON: 0,
  USDT: 1,
  USDC: 2,
  WETH: 3,
  WBTC: 4,
} as const;

export const TOKEN_INFO = {
  [TOKEN_TYPES.MON]: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000', // Native ETH
  },
  // [TOKEN_TYPES.USDT]: {
  //   name: 'Tether USD',
  //   symbol: 'USDT',
  //   decimals: 6,
  //   address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
  // },
  // [TOKEN_TYPES.USDC]: {
  //   name: 'USD Coin',
  //   symbol: 'USDC',
  //   decimals: 6,
  //   address: '0xA0b86a33E6E2b72b02d318B808d4bcFfCFa9CE5', // USDC on Ethereum
  // },
  [TOKEN_TYPES.WETH]: {
    name: 'WETH',
    symbol: 'WETH',
    decimals: 18,
    address: '0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37', // WETH
  },
  [TOKEN_TYPES.WBTC]: {
    name: 'WBTC',
    symbol: 'WBTC',
    decimals: 8,
    address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // Wbtc
  },
} as const;

export const MAX_LEVERAGE = 10;

// Smart Contract ABI based on the provided Solidity contract
export const QQB_PROTOCOL_ABI = [
  {
    "type": "function",
    "name": "buy",
    "inputs": [
      { "name": "types", "type": "uint8" },
      { "name": "mortgage", "type": "uint256" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "close",
    "inputs": [
      { "name": "positionId", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getUserPositions",
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "positions",
    "inputs": [
      { "name": "", "type": "uint256" }
    ],
    "outputs": [
      { "name": "types", "type": "uint8" },
      { "name": "owner", "type": "address" },
      { "name": "mortgageAmount", "type": "uint256" },
      { "name": "investAmount", "type": "uint256" },
      { "name": "tokenAmount", "type": "uint256" },
      { "name": "isOpen", "type": "bool" },
      { "name": "openTime", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdrawFees",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "PositionOpened",
    "inputs": [
      { "name": "positionId", "type": "uint256", "indexed": true },
      { "name": "user", "type": "address", "indexed": true },
      { "name": "tokenType", "type": "uint8", "indexed": false },
      { "name": "mortgage", "type": "uint256", "indexed": false },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "PositionClosed",
    "inputs": [
      { "name": "positionId", "type": "uint256", "indexed": true },
      { "name": "user", "type": "address", "indexed": true },
      { "name": "returns", "type": "uint256", "indexed": false }
    ]
  }
] as const;