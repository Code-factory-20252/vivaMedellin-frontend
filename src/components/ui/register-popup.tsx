import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Circle, CircleCheck } from "lucide-react";

type registerPopupProps = {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

export default function RegisterPopup({ dialogOpen, setDialogOpen }: registerPopupProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="font-geist [&>button:last-child]:hidden p-4 w-fit">
        <DialogHeader>
          <DialogTitle className="flex gap-3 font-medium text-sm">
            <CircleCheck />
            <p>Has creado la cuenta correctamente. Inicia sesión.</p>
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}