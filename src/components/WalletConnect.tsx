import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Smartphone } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import WalletSelectionDialog from "./WalletSelectionDialog";
import { detectWallets } from "@/lib/avalanche";
import { toast } from "sonner";

const WalletConnect = () => {
  const { walletAddress, isConnected, isConnecting, walletType, connectWallet, disconnectWallet } = useWallet();
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  const handleConnectClick = async () => {
    // Add small delay to allow wallet providers to inject
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const wallets = detectWallets();
    
    // Mobile device - connect directly to any available EVM wallet
    if (wallets.isMobile) {
      if (!wallets.hasAnyEthereumWallet) {
        toast.error("No wallet detected", {
          description: "Please open this page in your wallet's browser (MetaMask, Trust Wallet, or Bitget)",
          duration: 6000,
        });
        return;
      }
      
      // On mobile, connect with "metamask" type which will use the generic mobile connection
      toast.info("Connecting to your wallet...", {
        description: "Your wallet will auto-switch to Avalanche Fuji network",
      });
      connectWallet("metamask");
      return;
    }
    
    // Desktop - existing logic
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

  const wallets = detectWallets();

  return (
    <>
      <Button
        onClick={handleConnectClick}
        disabled={isConnecting}
        className="gap-2 glow-primary hover:scale-105 transition-transform"
      >
        {wallets.isMobile ? <Smartphone className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
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
