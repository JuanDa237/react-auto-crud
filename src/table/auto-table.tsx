import { Button } from '@/components/ui/button';

export interface AutoCrudTableProps<T> {
  schema: T;
}

export function AutoTable() {
  return (
    <div>
      AutoTable Component <Button>Hello World!</Button>
    </div>
  );
}
