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
export const CONTRACT_ADDRESS = "0x093fbe64204b69954863722f1851f22673c44947";

// Detect if user is on mobile device
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if user is on Android
export const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

// Detect available wallets with improved mobile detection
export const detectWallets = () => {
  const isMobile = isMobileDevice();
  const hasCore = !!(window as any).avalanche;
  const hasMetaMask = !!window.ethereum && !!(window.ethereum as any).isMetaMask;
  const hasTrustWallet = !!window.ethereum && !!(window.ethereum as any).isTrust;
  const hasBitget = !!window.ethereum && !!(window as any).bitkeep;
  const hasAnyEthereumWallet = !!window.ethereum;
  
  // Log detected providers for debugging
  console.log('Wallet detection:', {
    isMobile,
    hasEthereum: !!window.ethereum,
    isMetaMask: !!(window.ethereum as any)?.isMetaMask,
    isTrust: !!(window.ethereum as any)?.isTrust,
    isBitget: !!(window as any)?.bitkeep,
    providers: window.ethereum ? Object.keys(window.ethereum).filter(k => k.includes('is')) : []
  });
  
  return {
    hasCore,
    hasMetaMask,
    hasTrustWallet,
    hasBitget,
    hasAnyEthereumWallet,
    isMobile,
    hasAny: isMobile ? hasAnyEthereumWallet : (hasCore || hasMetaMask)
  };
};

// Get provider based on wallet type
const getProvider = (walletType: "metamask" | "core") => {
  if (walletType === "core") {
    const avalanche = (window as any).avalanche;
    if (!avalanche) {
      throw new Error("Core Wallet not found. Please install Core Wallet.");
    }
    return avalanche;
  } else {
    if (!window.ethereum) {
      throw new Error("MetaMask not found. Please install MetaMask.");
    }
    return window.ethereum;
  }
};

// Connect mobile wallet (any EVM wallet)
export const connectMobileWallet = async (): Promise<string> => {
  if (!window.ethereum) {
    throw new Error("No wallet found. Please install an EVM wallet like MetaMask, Trust Wallet, or any other Ethereum wallet.");
  }

  try {
    // Request account access first
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet.");
    }

    // Try to switch/add Fuji network - let wallet handle if already on correct network
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: FUJI_CONFIG.chainId }],
      });
      console.log('Successfully switched to Fuji network');
    } catch (switchError: any) {
      console.log('Switch error:', switchError);
      // Chain not added, add it (code 4902 or -32603)
      if (switchError.code === 4902 || switchError.code === -32603) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [FUJI_CONFIG],
          });
          console.log('Successfully added Fuji network');
        } catch (addError) {
          console.error('Could not add network:', addError);
          // If already connected to correct network, ignore error
        }
      } else if (switchError.code === 4001) {
        // User rejected the request
        throw new Error("You need to switch to Avalanche Fuji network to use this app");
      }
      // Ignore other switch errors - might already be on correct network
    }

    return accounts[0];
  } catch (error: any) {
    console.error('Mobile wallet connection error:', error);
    throw new Error(error.message || "Failed to connect wallet");
  }
};

// Connect wallet to Avalanche Fuji
export const connectWallet = async (walletType: "metamask" | "core"): Promise<string> => {
  // On mobile, use generic mobile wallet connection
  if (isMobileDevice()) {
    return connectMobileWallet();
  }

  const provider = getProvider(walletType);

  try {
    // Request account access
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });

    // Switch to Avalanche Fuji network
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: FUJI_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await provider.request({
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

// Get services from smart contract
export const getServices = async () => {
  // On mobile, use window.ethereum directly. On desktop, prefer Core wallet
  const ethereumProvider = isMobileDevice() 
    ? window.ethereum 
    : ((window as any).avalanche || window.ethereum);
  
  if (!ethereumProvider) {
    throw new Error("Wallet not connected");
  }

  try {
    const provider = new ethers.BrowserProvider(ethereumProvider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const serviceCount = await contract.serviceCount();
    console.log(`Total services on blockchain: ${serviceCount}`);
    const services = [];

    for (let i = 0; i < serviceCount; i++) {
      const service = await contract.getService(i);
      console.log(`Service ${i}:`, {
        name: service.name,
        active: service.active,
        price: ethers.formatEther(service.price)
      });

      // Only include active services
      if (service.active) {
        services.push({
          id: Number(service.id),
          name: service.name,
          category: service.category,
          description: service.description,
          price: ethers.formatEther(service.price),
          provider: service.provider,
          active: service.active,
        });
      }
    }

    console.log(`Active services found: ${services.length}`);
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
  // On mobile, use window.ethereum directly. On desktop, prefer Core wallet
  const ethereumProvider = isMobileDevice() 
    ? window.ethereum 
    : ((window as any).avalanche || window.ethereum);
  
  if (!ethereumProvider) {
    throw new Error("Wallet not connected");
  }

  try {
    const provider = new ethers.BrowserProvider(ethereumProvider);
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
  // On mobile, use window.ethereum directly. On desktop, prefer Core wallet
  const ethereumProvider = isMobileDevice() 
    ? window.ethereum 
    : ((window as any).avalanche || window.ethereum);
  
  if (!ethereumProvider || !walletAddress) {
    return false;
  }

  try {
    const provider = new ethers.BrowserProvider(ethereumProvider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const hasAccess = await contract.hasAccess(walletAddress, serviceId);
    return hasAccess;
  } catch (error: any) {
    console.error("Error checking access:", error);
    return false;
  }
};

// Get access expiry timestamp for a user and service
export const getAccessExpiry = async (
  serviceId: number,
  walletAddress: string
): Promise<number> => {
  // On mobile, use window.ethereum directly. On desktop, prefer Core wallet
  const ethereumProvider = isMobileDevice() 
    ? window.ethereum 
    : ((window as any).avalanche || window.ethereum);
  
  if (!ethereumProvider || !walletAddress) {
    return 0;
  }

  try {
    const provider = new ethers.BrowserProvider(ethereumProvider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const expiryTimestamp = await contract.getAccessExpiry(walletAddress, serviceId);
    return Number(expiryTimestamp);
  } catch (error: any) {
    console.error("Error getting access expiry:", error);
    return 0;
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
      }
    ],
    "name": "AccessExpired",
    "type": "event"
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
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "expiresAt",
        "type": "uint256"
      }
    ],
    "name": "AccessGranted",
    "type": "event"
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
        "internalType": "string",
        "name": "_category",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
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
        "internalType": "string",
        "name": "category",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
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
  },
  {
    "inputs": [],
    "name": "ACCESS_DURATION",
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
    "name": "accessExpiry",
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
    "name": "getAccessExpiry",
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
        "internalType": "string",
        "name": "category",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
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
        "internalType": "string",
        "name": "category",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
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
  }
];
