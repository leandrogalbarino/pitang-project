import { TableCell, TableRow } from '../ui/table';

export default function ListEmpty({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={3} className="h-32 text-center text-slate-400">
        {message}
      </TableCell>
    </TableRow>
  );
}
