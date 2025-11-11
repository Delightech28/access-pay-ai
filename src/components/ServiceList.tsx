import { useState, useEffect } from "react";
import { getServices } from "@/lib/avalanche";
import ServiceCard from "@/components/ServiceCard";
import { Loader2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  provider: string;
}

interface ServiceListProps {
  walletAddress: string;
  isConnected: boolean;
}

const ServiceList = ({ walletAddress, isConnected }: ServiceListProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      if (isConnected) {
        setLoading(true);
        try {
          const fetchedServices = await getServices();
          setServices(fetchedServices);
          setFilteredServices(fetchedServices);
          
          // Extract unique categories
          const categories = Array.from(
            new Set(fetchedServices.map((s) => s.category))
          );
          setAllCategories(categories);
        } catch (error) {
          console.error("Failed to fetch services:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchServices();
  }, [isConnected]);

  // Filter services based on search and category
  useEffect(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((service) =>
        selectedCategories.includes(service.category)
      );
    }

    setFilteredServices(filtered);
  }, [searchTerm, selectedCategories, services]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="p-12 rounded-2xl border-2 border-dashed border-border bg-card/50 backdrop-blur">
          <h3 className="text-2xl font-bold mb-3 text-foreground">
            Connect Your Wallet
          </h3>
          <p className="text-muted-foreground">
            Please connect your wallet to view available AI services
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground text-lg">Loading services...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="p-12 rounded-2xl border border-border bg-card/50 backdrop-blur">
          <h3 className="text-2xl font-bold mb-3 text-foreground">
            No Services Available
          </h3>
          <p className="text-muted-foreground">
            Services will appear here once they are registered on the blockchain
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-border focus:border-primary transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-border hover:border-primary transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      {selectedCategories.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allCategories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(searchTerm || selectedCategories.length > 0) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mt-4">
          Showing {filteredServices.length} of {services.length} services
        </p>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No services match your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              walletAddress={walletAddress}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceList;
