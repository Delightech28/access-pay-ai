import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { connectWallet as connectWalletLib, disconnectWallet as disconnectWalletLib } from "@/lib/avalanche";
import { toast } from "sonner";

interface WalletContextType {
  walletAddress: string;
  isConnected: boolean;
  isConnecting: boolean;
  walletType: "metamask" | "core" | null;
  connectWallet: (walletType: "metamask" | "core") => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<"metamask" | "core" | null>(null);

  // Load wallet from localStorage on mount - DO NOT auto-connect to prevent popup
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    const savedWalletType = localStorage.getItem("walletType") as "metamask" | "core" | null;
    
    if (savedAddress && savedWalletType) {
      setWalletAddress(savedAddress);
      setWalletType(savedWalletType);
      setIsConnected(true);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    const ethereumProvider = (window as any).avalanche || window.ethereum;
    
    if (ethereumProvider) {
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

      ethereumProvider.on("accountsChanged", handleAccountsChanged);
      return () => {
        ethereumProvider.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [walletAddress]);

  const connectWallet = async (selectedWalletType: "metamask" | "core") => {
    setIsConnecting(true);
    try {
      const address = await connectWalletLib(selectedWalletType);
      setWalletAddress(address);
      setWalletType(selectedWalletType);
      setIsConnected(true);
      localStorage.setItem("walletAddress", address);
      localStorage.setItem("walletType", selectedWalletType);
      
      const walletName = selectedWalletType === "core" ? "Core Wallet" : "MetaMask";
      toast.success(`${walletName} connected successfully!`, {
        description: `Address: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      toast.error("Failed to connect wallet", {
        description: error.message || "Please install the selected wallet",
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWalletLib();
    setWalletAddress("");
    setWalletType(null);
    setIsConnected(false);
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    toast.info("Wallet disconnected");
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected,
        isConnecting,
        walletType,
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
