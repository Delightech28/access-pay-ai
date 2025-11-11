import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const WalletConnect = () => {
  const { walletAddress, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

  if (isConnected) {
    return (
      <Button
        onClick={disconnectWallet}
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
      onClick={connectWallet}
      disabled={isConnecting}
      className="gap-2 glow-primary hover:scale-105 transition-transform"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnect;
