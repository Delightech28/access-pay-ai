import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { toast } from "sonner";
import { connectWallet, disconnectWallet } from "@/lib/avalanche";

interface WalletConnectProps {
  walletAddress: string;
  isConnected: boolean;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

const WalletConnect = ({
  walletAddress,
  isConnected,
  onConnect,
  onDisconnect,
}: WalletConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const address = await connectWallet();
      onConnect(address);
      toast.success("Wallet connected successfully!", {
        description: `Address: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      toast.error("Failed to connect wallet", {
        description: error.message || "Please install MetaMask or Core Wallet",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onDisconnect();
    toast.info("Wallet disconnected");
  };

  if (isConnected) {
    return (
      <Button
        onClick={handleDisconnect}
        variant="outline"
        className="gap-2"
      >
        <Wallet className="w-4 h-4" />
        <span className="font-mono">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
        <LogOut className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="gap-2 glow-primary hover:scale-105 transition-transform"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnect;
