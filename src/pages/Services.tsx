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
      
      <div className="container mx-auto px-4 py-12 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 text-gradient">
            AI Services
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            Premium AI models with blockchain-verified access
          </p>
        </header>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-12">
          <WalletConnect />
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="max-w-2xl mx-auto mb-12 p-5 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl glow-primary">
            <div className="flex items-center gap-3 text-sm flex-wrap justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full border border-accent/20">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent font-medium">Connected</span>
              </div>
              <span className="font-mono text-muted-foreground break-all">{walletAddress}</span>
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
