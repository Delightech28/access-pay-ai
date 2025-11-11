import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import ServiceList from "@/components/ServiceList";
import { Wallet, Zap } from "lucide-react";

const Index = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AI Access Protocol
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pay-per-access AI services on Avalanche using x402 payment standard
          </p>
        </header>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-12">
          <WalletConnect
            walletAddress={walletAddress}
            isConnected={isConnected}
            onConnect={(address) => {
              setWalletAddress(address);
              setIsConnected(true);
            }}
            onDisconnect={() => {
              setWalletAddress("");
              setIsConnected(false);
            }}
          />
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-lg border border-border bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Connected:</span>
              <span className="font-mono text-foreground">{walletAddress}</span>
            </div>
          </div>
        )}

        {/* Services */}
        <ServiceList walletAddress={walletAddress} isConnected={isConnected} />

        {/* Footer */}
        <footer className="mt-20 text-center text-muted-foreground text-sm">
          <p>Built for Avalanche Hack2Build Hackathon • x402 Payment Standard</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
