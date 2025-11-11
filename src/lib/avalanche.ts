// Avalanche blockchain utilities
// Uses ethers.js for contract interactions on Avalanche C-Chain
import { ethers } from "ethers";

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

// Contract address - Deployed on Avalanche Fuji Testnet
export const CONTRACT_ADDRESS = "0xec82b07d2acc99c9dd7eb1676420cba5997f7dfa";

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

// Service metadata (off-chain data for descriptions and categories)
const SERVICE_METADATA: Record<number, { description: string; category: string }> = {
  0: {
    description: "Premium language model with advanced reasoning capabilities",
    category: "LLM",
  },
  1: {
    description: "High-quality AI image generation from text prompts",
    category: "Image",
  },
  2: {
    description: "Advanced conversational AI assistant",
    category: "LLM",
  },
};

// Get services from smart contract
export const getServices = async () => {
  if (!window.ethereum) {
    throw new Error("Wallet not connected");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const serviceCount = await contract.serviceCount();
    const services = [];

    for (let i = 0; i < serviceCount; i++) {
      const service = await contract.getService(i);
      const metadata = SERVICE_METADATA[i] || {
        description: "AI service access",
        category: "AI",
      };

      services.push({
        id: Number(service.id),
        name: service.name,
        description: metadata.description,
        price: ethers.formatEther(service.price),
        provider: service.provider,
        category: metadata.category,
      });
    }

    return services;
  } catch (error: any) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services from contract");
  }
};

// Pay for service using smart contract
export const payForService = async (
  serviceId: number,
  price: string,
  walletAddress: string
): Promise<void> => {
  if (!window.ethereum) {
    throw new Error("Wallet not connected");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Convert price to wei
    const priceInWei = ethers.parseEther(price);

    // Call payForService with the exact price
    const tx = await contract.payForService(serviceId, {
      value: priceInWei,
    });

    // Wait for transaction confirmation
    await tx.wait();
    
    console.log(`Payment successful for service ${serviceId}`);
  } catch (error: any) {
    console.error("Payment error:", error);
    throw new Error(error.message || "Transaction failed");
  }
};

// Check if user has access to service
export const checkAccess = async (
  serviceId: number,
  walletAddress: string
): Promise<boolean> => {
  if (!window.ethereum || !walletAddress) {
    return false;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const hasAccess = await contract.hasAccess(walletAddress, serviceId);
    return hasAccess;
  } catch (error: any) {
    console.error("Error checking access:", error);
    return false;
  }
};

// Contract ABI from deployed contract
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "serviceId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "AccessGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "serviceId",
        "type": "uint256"
      }
    ],
    "name": "ServiceDeactivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "serviceId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "provider",
        "type": "address"
      }
    ],
    "name": "ServiceRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "accessGranted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_serviceId",
        "type": "uint256"
      }
    ],
    "name": "deactivateService",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_serviceId",
        "type": "uint256"
      }
    ],
    "name": "getService",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "provider",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_serviceId",
        "type": "uint256"
      }
    ],
    "name": "hasAccess",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_serviceId",
        "type": "uint256"
      }
    ],
    "name": "payForService",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_provider",
        "type": "address"
      }
    ],
    "name": "registerService",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "serviceCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "services",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "provider",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
