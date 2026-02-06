// Components
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export interface AutoTableSheetProps {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AutoTableSheet({
  open,
  title,
  description,
  onOpenChange,
  children,
}: AutoTableSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
