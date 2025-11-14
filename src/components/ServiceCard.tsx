import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Zap, Send, MessageSquare, X, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { payForService, getAccessExpiry } from "@/lib/avalanche";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  provider: string;
}

interface ServiceCardProps {
  service: Service;
  walletAddress: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const ServiceCard = ({ service, walletAddress }: ServiceCardProps) => {
  const [isPaying, setIsPaying] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const fetchAccessStatus = async () => {
      if (walletAddress) {
        try {
          const params = new URLSearchParams({
            walletAddress,
            serviceId: service.id.toString()
          });

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-access?${params}`,
            {
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              }
            }
          );

          const result = await response.json();
          setHasAccess(result.hasAccess);
          
          if (result.hasAccess && result.expiresAt) {
            setExpiresAt(result.expiresAt);
          } else {
            setExpiresAt(null);
          }
        } catch (error) {
          console.error("Error checking access:", error);
        }
      }
    };

    fetchAccessStatus();
  }, [service.id, walletAddress]);

  // Update countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expired");
        setHasAccess(false);
        setExpiresAt(null);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handlePayment = async () => {
    if (!walletAddress) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet first",
      });
      return;
    }

    try {
      setIsPaying(true);
      await payForService(service.id, service.price, walletAddress);

      // Attempt to track access in backend, but don't fail UX if this errors
      try {
        const { data, error } = await supabase.functions.invoke('track-access', {
          body: {
            walletAddress,
            serviceId: service.id,
            priceInAVAX: service.price
          }
        });

        if (!error && data?.expiresAt) {
          setExpiresAt(data.expiresAt);
        } else if (error) {
          console.warn('track-access failed, falling back to on-chain expiry:', error);
        }
      } catch (trackError) {
        console.warn('track-access invocation error:', trackError);
      }

      // Fallback: fetch on-chain expiry to update UI if backend tracking failed
      if (!expiresAt) {
        const onChainExpiry = await getAccessExpiry(service.id, walletAddress);
        if (onChainExpiry && onChainExpiry > 0) {
          setExpiresAt(new Date(onChainExpiry * 1000).toISOString());
        }
      }

      setHasAccess(true);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Payment Failed", {
        description: error.message || "Failed to process payment",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handleSendMessage = async () => {
    if (!prompt.trim() || !walletAddress) return;
    const userMessage: ChatMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          userAddress: walletAddress,
          serviceId: service.id,
          prompt: userMessage.content,
        }
      });

      // Check for errors in response data (HTTP error responses)
      if (data?.error) {
        if (data.error === 'Payment Required') {
          toast.error("Access Required", {
            description: "You need to pay for access to use this service.",
          });
          setHasAccess(false);
          return;
        }
        
        if (data.error === 'Access Expired') {
          toast.error("Access Expired", {
            description: "Your access has expired. Please pay again to continue.",
          });
          setHasAccess(false);
          setExpiresAt(null);
          return;
        }

        if (data.error === 'Service Not Available') {
          toast.error("Service Not Available", {
            description: "This AI service is not yet integrated. Please try Gemini AI instead.",
          });
          return;
        }

        if (data.error === 'AI Service Error') {
          toast.error("AI Service Error", {
            description: data.message || "Failed to connect to AI. Please try again.",
          });
          return;
        }
      }

      // Check for network/connection errors
      if (error) {
        toast.error("Connection Error", {
          description: "Failed to connect to AI service. Please try again.",
        });
        return;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Connection Error", {
        description: error.message || "Failed to connect to AI service. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="group relative p-6 gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:glow-primary overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex flex-col h-full">
          {/* Header with Category Badge */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {service.name}
              </h3>
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant="secondary" 
                  className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {service.category}
                </Badge>
                {hasAccess && expiresAt && (
                  <>
                    <Badge variant="default" className="bg-accent text-accent-foreground text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{timeRemaining}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-3 min-h-[40px]">
              {service.description}
            </p>
            
            {/* Provider */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Provider:</span>
              <span className="font-mono text-foreground/80 truncate">
                {service.provider.slice(0, 6)}...{service.provider.slice(-4)}
              </span>
            </div>
          </div>

          {/* Price Display */}
          <div className="mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {service.price}
              </span>
              <span className="text-sm text-muted-foreground font-medium">AVAX</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-auto space-y-3">
            {hasAccess ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Access Granted</span>
                  </div>
                  <Button
                    onClick={() => setShowChat(!showChat)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {showChat ? (
                      <>
                        <X className="w-4 h-4" />
                        Close
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </>
                    )}
                  </Button>
                </div>

                {/* Chat Interface */}
                {showChat && (
                  <div className="w-full space-y-3 pt-3 border-t border-border/50">
                     <ScrollArea className="h-64 w-full rounded-lg border border-border bg-background/50 p-3">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          <div className="text-center space-y-2">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">Start chatting with {service.name}</p>
                            <p className="text-xs">Real AI • Blockchain-verified access</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                                  msg.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground border border-border"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                          {isLoading && (
                            <div className="flex justify-start">
                              <div className="bg-muted border border-border rounded-lg px-3 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!prompt.trim() || isLoading}
                        size="icon"
                        className="shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button
                onClick={handlePayment}
                disabled={isPaying}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/50"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span className="font-medium">Pay & Get 1 Hour Access</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              🎉 Payment Successful!
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <div className="flex items-center gap-2 text-base">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>You now have 1-hour access to <strong>{service.name}</strong></span>
              </div>
              
              {expiresAt && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Access expires at:</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {new Date(expiresAt).toLocaleString()}
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Your access will automatically expire after 1 hour. You can refresh or return to this page anytime within that period.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setShowSuccessModal(false)} variant="outline">
              Close
            </Button>
            <Button onClick={() => { setShowSuccessModal(false); setShowChat(true); }}>
              Start Chatting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServiceCard;
