import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { payForService, checkAccess } from "@/lib/avalanche";

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  provider: string;
  category: string;
}

interface ServiceCardProps {
  service: Service;
  walletAddress: string;
}

const ServiceCard = ({ service, walletAddress }: ServiceCardProps) => {
  const [isPaying, setIsPaying] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

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
    <Card className="p-6 gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:glow-primary">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
            <Badge variant="secondary" className="ml-2">
              {service.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
          <p className="text-xs text-muted-foreground">
            Provider: <span className="font-mono">{service.provider}</span>
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">{service.price}</span>
            <span className="text-sm text-muted-foreground">AVAX</span>
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto">
          {hasAccess ? (
            <Button
              disabled
              variant="outline"
              className="w-full gap-2 border-accent text-accent"
            >
              <CheckCircle2 className="w-4 h-4" />
              Access Granted
            </Button>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={isPaying}
              className="w-full gap-2 hover:scale-105 transition-transform"
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Pay & Access
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
