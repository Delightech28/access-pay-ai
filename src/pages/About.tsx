import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Zap, Shield, Coins, Code, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  const features = [
    {
      icon: Zap,
      title: "x402 Payment Standard",
      description: "Revolutionary HTTP status code for payment-required AI services, enabling seamless pay-per-access functionality."
    },
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Built on Avalanche C-Chain with smart contract-based access control ensuring transparent and secure payments."
    },
    {
      icon: Coins,
      title: "Pay-Per-Access",
      description: "Only pay for what you use. No subscriptions, no commitments. Access premium AI services on demand."
    },
    {
      icon: Code,
      title: "Open Source",
      description: "Fully open-source smart contracts and frontend code. Auditable, transparent, and community-driven."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="mb-16 text-center max-w-4xl mx-auto">
          <div className="relative inline-block mb-6">
            <Zap className="w-20 h-20 text-primary animate-pulse" />
            <div className="absolute inset-0 blur-2xl bg-primary/30 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            NeuraPay
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A decentralized marketplace for AI services powered by the x402 payment standard 
            and Avalanche blockchain technology.
          </p>
        </header>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:glow-primary"
                >
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="p-8 gradient-card border-border">
            <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground">
                    Connect your MetaMask or Core wallet to the Avalanche Fuji testnet.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Browse AI Services</h3>
                  <p className="text-muted-foreground">
                    Explore available AI services including LLMs, image generation, and more.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Pay with AVAX</h3>
                  <p className="text-muted-foreground">
                    Pay for access using AVAX. The smart contract grants you access upon payment.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Access the Service</h3>
                  <p className="text-muted-foreground">
                    Once paid, access is granted immediately. The backend verifies payment via x402 protocol.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contract Info */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="p-8 gradient-card border-border">
            <h2 className="text-2xl font-bold mb-4">Smart Contract</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contract Address</p>
                <p className="font-mono text-sm break-all text-foreground">
                  0xec82b07d2acc99c9dd7eb1676420cba5997f7dfa
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Network</p>
                <p className="text-foreground">Avalanche Fuji Testnet (Chain ID: 43113)</p>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 border-border hover:border-primary transition-colors"
                asChild
              >
                <a 
                  href="https://testnet.snowtrace.io/address/0xec82b07d2acc99c9dd7eb1676420cba5997f7dfa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on SnowTrace
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm border-t border-border pt-8">
          <p className="mb-2">Built for Avalanche Hack2Build Hackathon</p>
          <p className="text-xs">Open source • x402 Payment Standard • Avalanche C-Chain</p>
        </footer>
      </div>
    </div>
  );
};

export default About;
