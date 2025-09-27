import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {}

export default function registerPopup({ isDialogOpen, setIsDialogOpen }: { isDialogOpen: boolean, setIsDialogOpen: (open: boolean) => void }) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="font-geist">
        <DialogHeader>
          <DialogTitle>Registro exitoso</DialogTitle>
          <DialogDescription>
            Has creado la cuenta correctamente. Inicia sesión.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}