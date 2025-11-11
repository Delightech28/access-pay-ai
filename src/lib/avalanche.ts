// Avalanche blockchain utilities
// Uses ethers.js for contract interactions on Avalanche C-Chain

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Avalanche Fuji Testnet configuration
export const FUJI_CONFIG = {
  chainId: "0xA869", // 43113 in hex
  chainName: "Avalanche Fuji Testnet",
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

// Contract address (deploy and update this)
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Update after deployment

// Connect wallet to Avalanche Fuji
export const connectWallet = async (): Promise<string> => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask or Core Wallet");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Switch to Avalanche Fuji network
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: FUJI_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [FUJI_CONFIG],
        });
      } else {
        throw switchError;
      }
    }

    return accounts[0];
  } catch (error: any) {
    throw new Error(error.message || "Failed to connect wallet");
  }
};

// Disconnect wallet
export const disconnectWallet = () => {
  // Note: MetaMask doesn't have a programmatic disconnect
  // This just clears local state
  console.log("Wallet disconnected");
};

// Get mock services (will be replaced with contract calls)
export const getServices = () => {
  return [
    {
      id: 1,
      name: "GPT-4 API Access",
      description: "Premium language model with advanced reasoning capabilities",
      price: "0.01",
      provider: "OpenAI",
      category: "LLM",
    },
    {
      id: 2,
      name: "DALL-E Image Generation",
      description: "High-quality AI image generation from text prompts",
      price: "0.005",
      provider: "OpenAI",
      category: "Image",
    },
    {
      id: 3,
      name: "Claude AI Chat",
      description: "Anthropic's advanced conversational AI assistant",
      price: "0.008",
      provider: "Anthropic",
      category: "LLM",
    },
    {
      id: 4,
      name: "Whisper Transcription",
      description: "High-accuracy speech-to-text transcription service",
      price: "0.003",
      provider: "OpenAI",
      category: "Audio",
    },
    {
      id: 5,
      name: "Stable Diffusion XL",
      description: "Open-source image generation with fine-tuned models",
      price: "0.004",
      provider: "Stability AI",
      category: "Image",
    },
    {
      id: 6,
      name: "Code Interpreter",
      description: "AI-powered code execution and analysis environment",
      price: "0.012",
      provider: "Custom",
      category: "Code",
    },
  ];
};

// Pay for service (mock implementation - will integrate with contract)
export const payForService = async (
  serviceId: number,
  price: string,
  walletAddress: string
): Promise<void> => {
  if (!window.ethereum) {
    throw new Error("Wallet not connected");
  }

  // Simulate payment transaction
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock transaction
      console.log(`Payment of ${price} AVAX for service ${serviceId} from ${walletAddress}`);
      
      // In production, this would:
      // 1. Create contract instance with ethers.js
      // 2. Call contract.payForService(serviceId) with value
      // 3. Wait for transaction confirmation
      // 4. Emit AccessGranted event
      
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        resolve();
      } else {
        reject(new Error("Transaction failed"));
      }
    }, 2000);
  });
};

// Check if user has access to service
export const checkAccess = async (
  serviceId: number,
  walletAddress: string
): Promise<boolean> => {
  // In production, this would call contract.hasAccess(walletAddress, serviceId)
  return false;
};

// Get contract ABI (simplified - full ABI would be imported from compiled contract)
export const CONTRACT_ABI = [
  "function registerService(string memory name, uint256 price) external",
  "function payForService(uint256 serviceId) external payable",
  "function hasAccess(address user, uint256 serviceId) external view returns (bool)",
  "function withdraw() external",
  "event ServiceRegistered(uint256 indexed serviceId, string name, uint256 price)",
  "event AccessGranted(address indexed user, uint256 indexed serviceId, uint256 amount)",
];
