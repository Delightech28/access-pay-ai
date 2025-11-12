import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface WalletSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectWallet: (walletType: "metamask" | "core") => void;
}

const WalletSelectionDialog = ({
  open,
  onOpenChange,
  onSelectWallet,
}: WalletSelectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Wallet</DialogTitle>
          <DialogDescription>
            Choose which wallet you want to connect with
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={() => onSelectWallet("core")}
            className="w-full gap-2 h-14 text-base"
            variant="default"
          >
            <Wallet className="w-5 h-5" />
            Core Wallet (Avalanche)
          </Button>
          <Button
            onClick={() => onSelectWallet("metamask")}
            className="w-full gap-2 h-14 text-base"
            variant="outline"
          >
            <Wallet className="w-5 h-5" />
            MetaMask
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectionDialog;
