import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet, History, Shield, Settings, TrendingUp } from "lucide-react";

const Profile = () => {
  const { walletAddress, isConnected } = useWallet();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 text-gradient">
            Profile
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Manage your wallet and track your activity
          </p>
        </header>

        {!isConnected ? (
          <div className="max-w-2xl mx-auto">
            <Card className="gradient-card border-primary/20 p-12 glow-primary">
              <div className="text-center space-y-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-glow-pulse" />
                    <div className="relative bg-gradient-to-br from-primary to-accent p-6 rounded-2xl">
                      <Wallet className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground">Connect Your Wallet</h2>
                  <p className="text-muted-foreground text-lg">
                    Access your profile and service history
                  </p>
                </div>
                <WalletConnect />
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Wallet Info Card */}
            <Card className="gradient-card border-primary/20 glow-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  Connected Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Wallet Address</p>
                    <p className="font-mono text-lg text-foreground break-all">{walletAddress}</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-accent/5 rounded-xl border border-accent/20">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                    <span className="text-accent font-medium">Active on Avalanche Fuji Testnet</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Cards Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Access History */}
              <Card className="gradient-card border-border hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <History className="w-5 h-5 text-primary" />
                    </div>
                    Access History
                  </CardTitle>
                  <CardDescription className="text-base">
                    Track your service usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-flex p-4 bg-muted/30 rounded-2xl">
                      <History className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">Coming Soon</p>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Stats */}
              <Card className="gradient-card border-border hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-accent/10 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    Activity Stats
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your usage analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-flex p-4 bg-muted/30 rounded-2xl">
                      <TrendingUp className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">Coming Soon</p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="gradient-card border-border hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    Security
                  </CardTitle>
                  <CardDescription className="text-base">
                    Manage security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-flex p-4 bg-muted/30 rounded-2xl">
                      <Shield className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">Coming Soon</p>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="gradient-card border-border hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    Preferences
                  </CardTitle>
                  <CardDescription className="text-base">
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-flex p-4 bg-muted/30 rounded-2xl">
                      <Settings className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">Coming Soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
