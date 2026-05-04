import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="font-bold">Pitang Reembolso</span>
        </div>
        <p className="text-sm text-slate-400">
          © 2026 Pitang Reimburse System. Desenvolvido com foco em excelência financeira.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">Privacidade</a>
          <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">Termos</a>
        </div>
      </div>
    </footer>
  );
}
