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
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Zap className="w-16 h-16 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-2xl bg-primary/30 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-3 duration-700">
              NeuraPay
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Neural Payment Protocol - Seamless AI service payments on Avalanche
          </p>
        </header>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
          <WalletConnect />
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-lg border border-border bg-card/50 backdrop-blur animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <Wallet className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Connected:</span>
              <span className="font-mono text-foreground break-all">{walletAddress}</span>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
          <ServiceList walletAddress={walletAddress} isConnected={isConnected} />
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p className="mb-2">Built for Avalanche Hack2Build Hackathon</p>
          <p className="text-xs">Powered by x402 Payment Standard on Avalanche C-Chain</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
