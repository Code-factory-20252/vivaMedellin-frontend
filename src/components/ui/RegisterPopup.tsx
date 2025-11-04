import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CircleCheck } from 'lucide-react';

type registerPopupProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
};

export default function RegisterPopup({ isDialogOpen, setIsDialogOpen }: registerPopupProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="font-geist [&>button:last-child]:hidden p-4 w-fit">
        <DialogHeader>
          <DialogTitle className="flex gap-3 font-medium text-sm">
            <CircleCheck />
            <p>Has creado la cuenta correctamente. Inicia sesión.</p>
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
