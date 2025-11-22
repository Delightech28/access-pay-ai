import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import { Wallet, History, Shield, Settings, Clock, DollarSign, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const serviceNames: { [key: number]: string } = {
  0: "Gemini AI",
  1: "GPT-4",
};

const Profile = () => {
  const { walletAddress, isConnected, disconnectWallet } = useWallet();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch access history
  const { data: accessHistory, isLoading } = useQuery({
    queryKey: ["accessHistory", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      const { data, error } = await supabase
        .from("access_records")
        .select("*")
        .eq("wallet_address", walletAddress)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!walletAddress && isConnected,
  });

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
              <WalletConnect />
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
                <WalletConnect />
              </div>
            </Card>

            {/* Profile Tabs */}
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Access History
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Access History Tab */}
              <TabsContent value="history" className="space-y-4">
                <Card className="p-6 gradient-card border-border">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <History className="w-6 h-6 text-primary" />
                    Your Access History
                  </h3>
                  
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : !accessHistory || accessHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No payment history yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Purchase access to AI services to see your history here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {accessHistory.map((record) => {
                        const isExpired = new Date(record.expires_at) < new Date();
                        return (
                          <Card key={record.id} className="p-4 border-border bg-card/50">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg mb-1">
                                  {serviceNames[record.service_id] || `Service ${record.service_id}`}
                                </h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Purchased: {format(new Date(record.created_at!), "PPp")}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {isExpired ? "Expired" : "Expires"}: {format(new Date(record.expires_at), "PPp")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isExpired 
                                  ? "bg-red-500/20 text-red-400" 
                                  : "bg-green-500/20 text-green-400"
                              }`}>
                                {isExpired ? "Expired" : "Active"}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-4">
                <Card className="p-6 gradient-card border-border">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-accent" />
                    Wallet Security
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Connected Wallet</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your wallet is securely connected to NeuraPay. You can disconnect at any time.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={disconnectWallet}
                        className="w-full md:w-auto"
                      >
                        Disconnect Wallet
                      </Button>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h4 className="font-semibold mb-2">Security Tips</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Never share your private keys or seed phrase with anyone</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Always verify the URL before connecting your wallet</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Review transaction details carefully before signing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Keep your wallet software updated to the latest version</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card className="p-6 gradient-card border-border">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-primary" />
                    Preferences
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about access expiry
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Toggle between light and dark theme
                        </p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>

                    <div className="border-t border-border pt-6">
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-sm text-muted-foreground">
                        NeuraPay v1.0.0 - Blockchain-powered AI service access platform
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
