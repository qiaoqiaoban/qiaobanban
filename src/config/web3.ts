import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';

const projectId = 'qiaoqiaoban-exchange'; // You can get a project ID from WalletConnect Cloud

export const config = getDefaultConfig({
  appName: 'Qiaoqiaoban Exchange',
  projectId,
  chains: [
    {
      id: 10143 ,
      name: 'Monad Testnet',
      nativeCurrency: { name: 'Mon', symbol: 'Mon', decimals: 18 },
      rpcUrls: {
        default: {
          http: ['https://monad-testnet.drpc.org'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Monscan',
          url: 'https://testnet.monadexplorer.com/',
          apiUrl: 'https://testnet.monadexplorer.com/',
        },
      },
      contracts: {
        ensRegistry: {
          address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        },
        ensUniversalResolver: {
          address: '0xce01f8eee7E479C928F8919abD53E553a36CeF67',
          blockCreated: 19_258_213,
        },
        multicall3: {
          address: '0xca11bde05977b3631167028862be2a173976ca11',
          blockCreated: 14_353_601,
        },
      },
    }
  ],
  ssr: false, // If your app doesn't use SSR, set this to false
});

export const SUPPORTED_CHAIN_ID = mainnet.id;