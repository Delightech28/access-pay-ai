import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import WalletSelectionDialog from "./WalletSelectionDialog";
import { detectWallets } from "@/lib/avalanche";
import { toast } from "sonner";

const WalletConnect = () => {
  const { walletAddress, isConnected, isConnecting, walletType, connectWallet, disconnectWallet } = useWallet();
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  const handleConnectClick = () => {
    const wallets = detectWallets();
    
    if (!wallets.hasAny) {
      toast.error("No wallet found", {
        description: "Please install Core Wallet or MetaMask",
      });
      return;
    }

    // If only one wallet is available, connect directly
    if (wallets.hasCore && !wallets.hasMetaMask) {
      connectWallet("core");
    } else if (wallets.hasMetaMask && !wallets.hasCore) {
      connectWallet("metamask");
    } else {
      // Both available, show selection dialog
      setShowWalletDialog(true);
    }
  };

  const handleWalletSelect = async (selectedWalletType: "metamask" | "core") => {
    setShowWalletDialog(false);
    await connectWallet(selectedWalletType);
  };

  if (isConnected) {
    const walletName = walletType === "core" ? "Core" : "MetaMask";
    
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
        <span className="text-xs text-muted-foreground">({walletName})</span>
        <LogOut className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleConnectClick}
        disabled={isConnecting}
        className="gap-2 glow-primary hover:scale-105 transition-transform"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      
      <WalletSelectionDialog
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onSelectWallet={handleWalletSelect}
      />
    </>
  );
};

export default WalletConnect;
