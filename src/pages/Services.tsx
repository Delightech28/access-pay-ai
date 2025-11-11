import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import ServiceList from "@/components/ServiceList";
import { Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const Services = () => {
  const { walletAddress, isConnected } = useWallet();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            AI Services Marketplace
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse and access premium AI services powered by blockchain payments
          </p>
        </header>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletConnect />
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-lg border border-border bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <Wallet className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Connected:</span>
              <span className="font-mono text-foreground break-all">{walletAddress}</span>
            </div>
          </div>
        )}

        {/* Services List */}
        <ServiceList walletAddress={walletAddress} isConnected={isConnected} />
      </div>
    </div>
  );
};

export default Services;
