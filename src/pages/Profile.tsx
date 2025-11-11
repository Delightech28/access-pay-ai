import { useState } from "react";
import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import { Wallet, History, Shield, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your wallet and view your service access history
          </p>
        </header>

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <Card className="p-12 gradient-card border-border">
              <Wallet className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-8">
                Connect your wallet to view your profile and service access history
              </p>
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
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Wallet Info Card */}
            <Card className="p-6 mb-8 gradient-card border-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Connected Wallet</h3>
                    <p className="font-mono text-sm text-muted-foreground break-all">
                      {walletAddress}
                    </p>
                  </div>
                </div>
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
            </Card>

            {/* Profile Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Access History */}
              <Card className="p-6 gradient-card border-border hover:border-primary/50 transition-all hover:glow-primary">
                <History className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Access History</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View all services you've accessed and payment history
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </Card>

              {/* Security */}
              <Card className="p-6 gradient-card border-border hover:border-primary/50 transition-all hover:glow-primary">
                <Shield className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2">Security</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your wallet security and permissions
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </Card>

              {/* Settings */}
              <Card className="p-6 gradient-card border-border hover:border-primary/50 transition-all hover:glow-primary">
                <Settings className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize your preferences and notifications
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
