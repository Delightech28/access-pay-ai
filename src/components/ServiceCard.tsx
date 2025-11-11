import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { payForService, checkAccess } from "@/lib/avalanche";

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

const ServiceCard = ({ service, walletAddress }: ServiceCardProps) => {
  const [isPaying, setIsPaying] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const fetchAccessStatus = async () => {
      if (walletAddress) {
        const access = await checkAccess(service.id, walletAddress);
        setHasAccess(access);
      }
    };

    fetchAccessStatus();
  }, [service.id, walletAddress]);

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      await payForService(service.id, service.price, walletAddress);
      setHasAccess(true);
      toast.success("Payment successful!", {
        description: `You now have access to ${service.name}`,
      });
    } catch (error: any) {
      toast.error("Payment failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsPaying(false);
    }
  };

  return (
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
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {service.category}
            </Badge>
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
        <div className="mt-auto">
          {hasAccess ? (
            <Button
              disabled
              variant="outline"
              className="w-full gap-2 border-accent/50 text-accent bg-accent/5 cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Access Granted ✅</span>
            </Button>
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
                  <span className="font-medium">Pay & Access</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
