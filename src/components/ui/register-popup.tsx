import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type registerPopupProps = {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

export default function RegisterPopup({ dialogOpen, setDialogOpen }: registerPopupProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="font-geist">
        <DialogHeader>
          <DialogTitle>Has creado la cuenta correctamente. Inicia sesión.</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}