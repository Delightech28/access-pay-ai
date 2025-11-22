import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import ServiceList from "@/components/ServiceList";
import { Wallet, Zap } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const Index = () => {
  const { walletAddress, isConnected } = useWallet();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 lg:px-8">
        {/* Header */}
        <header className="mb-16 text-center relative">
          <div className="absolute inset-0 gradient-hero opacity-50" />
          <div className="relative">
            <div className="flex items-center justify-center gap-4 mb-6 animate-slide-up">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-2xl animate-glow-pulse" />
                <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-2xl">
                  <Zap className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 animate-fade-in">
              <span className="text-gradient">NeuraPay</span>
            </h1>
            <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed animate-fade-in mb-4" style={{animationDelay: '0.1s'}}>
              Neural Payment Protocol for AI Services
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
              Seamless, blockchain-verified access to premium AI models on Avalanche
            </p>
          </div>
        </header>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-16 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <WalletConnect />
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="max-w-2xl mx-auto mb-12 p-5 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl animate-fade-in glow-primary">
            <div className="flex items-center gap-3 text-sm flex-wrap justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full border border-accent/20">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent font-medium">Connected</span>
              </div>
              <span className="font-mono text-muted-foreground break-all">{walletAddress}</span>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
          <ServiceList walletAddress={walletAddress} isConnected={isConnected} />
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-border/50 text-center">
          <div className="space-y-3">
            <p className="text-muted-foreground font-medium">Built for Avalanche Hack2Build Hackathon</p>
            <p className="text-sm text-muted-foreground/60">Powered by x402 Payment Standard on Avalanche C-Chain</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
