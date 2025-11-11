import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { connectWallet as connectWalletLib, disconnectWallet as disconnectWalletLib } from "@/lib/avalanche";
import { toast } from "sonner";

interface WalletContextType {
  walletAddress: string;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletAddress(savedAddress);
      setIsConnected(true);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          handleDisconnect();
        } else if (accounts[0] !== walletAddress) {
          // User switched accounts
          const newAddress = accounts[0];
          setWalletAddress(newAddress);
          setIsConnected(true);
          localStorage.setItem("walletAddress", newAddress);
          toast.info("Wallet account changed", {
            description: `${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`,
          });
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await connectWalletLib();
      setWalletAddress(address);
      setIsConnected(true);
      localStorage.setItem("walletAddress", address);
      toast.success("Wallet connected successfully!", {
        description: `Address: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      toast.error("Failed to connect wallet", {
        description: error.message || "Please install MetaMask or Core Wallet",
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWalletLib();
    setWalletAddress("");
    setIsConnected(false);
    localStorage.removeItem("walletAddress");
    toast.info("Wallet disconnected");
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet: handleDisconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
