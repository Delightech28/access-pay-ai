import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import { Wallet, History, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface AccessRecord {
  id: string;
  service_id: number;
  wallet_address: string;
  expires_at: string;
  created_at: string;
}

const Profile = () => {
  const { walletAddress, isConnected } = useWallet();
  const [accessHistory, setAccessHistory] = useState<AccessRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchAccessHistory();
    }
  }, [isConnected, walletAddress]);

  const fetchAccessHistory = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-access-history', {
        body: { walletAddress }
      });
      
      if (error) throw error;
      
      setAccessHistory(data.accessHistory || []);
    } catch (error) {
      console.error('Error fetching access history:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAccessActive = (expiresAt: string) => {
    return new Date(expiresAt) > new Date();
  };

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

            {/* Access History Section */}
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-6 h-6 text-primary" />
                  Access History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : accessHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No access history yet. Start by purchasing access to AI services!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accessHistory.map((record) => {
                      const isActive = isAccessActive(record.expires_at);
                      
                      return (
                        <div 
                          key={record.id}
                          className={`p-4 rounded-lg border transition-all ${
                            isActive 
                              ? 'border-accent/50 bg-accent/5' 
                              : 'border-border bg-card/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">Service #{record.service_id}</h4>
                                {isActive ? (
                                  <span className="flex items-center gap-1 text-xs text-accent">
                                    <CheckCircle className="w-3 h-3" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <XCircle className="w-3 h-3" />
                                    Expired
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    Purchased {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                
                                {isActive ? (
                                  <div className="text-accent">
                                    Expires {formatDistanceToNow(new Date(record.expires_at), { addSuffix: true })}
                                  </div>
                                ) : (
                                  <div>
                                    Expired {formatDistanceToNow(new Date(record.expires_at), { addSuffix: true })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
