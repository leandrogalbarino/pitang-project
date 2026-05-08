import { TableCell, TableRow } from '../table';

export default function ListEmpty({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-24 w-full text-center text-slate-400">
        {message}
      </TableCell>
    </TableRow>
  );
}
