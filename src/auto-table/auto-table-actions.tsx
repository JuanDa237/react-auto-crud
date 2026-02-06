import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Pencil, Trash2 } from 'lucide-react';

type EditActionProps<T extends z.ZodObject<any>> = {
  row: z.infer<T>;
  onEdit: (row: z.infer<T>) => void;
};

type DeleteActionProps<T extends z.ZodObject<any>> = {
  row: z.infer<T>;
  onDelete: (row: z.infer<T>) => void;
  isDeleting?: boolean;
};

export function EditAction<T extends z.ZodObject<any>>({ row, onEdit }: EditActionProps<T>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        onEdit(row);
      }}
    >
      <Pencil />
    </Button>
  );
}

export function DeleteAction<T extends z.ZodObject<any>>({
  row,
  onDelete,
  isDeleting,
}: DeleteActionProps<T>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="text-red-600" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDelete(row)} disabled={isDeleting}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
