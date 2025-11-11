import { useState, useEffect } from "react";
import ServiceCard from "@/components/ServiceCard";
import { getServices } from "@/lib/avalanche";

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  provider: string;
  category: string;
}

interface ServiceListProps {
  walletAddress: string;
  isConnected: boolean;
}

const ServiceList = ({ walletAddress, isConnected }: ServiceListProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const fetchedServices = await getServices();
        setServices(fetchedServices);
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isConnected) {
      loadServices();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="p-8 rounded-lg border border-border bg-card/30 backdrop-blur">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Connect your wallet to view and access AI services on Avalanche
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Loading services from contract...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="p-8 rounded-lg border border-border bg-card/30 backdrop-blur">
          <h2 className="text-2xl font-bold mb-4">No Services Available</h2>
          <p className="text-muted-foreground">
            No services registered yet. Register services using the smart contract.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Available AI Services</h2>
        <p className="text-muted-foreground">
          Pay to access premium AI models and APIs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            walletAddress={walletAddress}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceList;
