import { 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  Globe, 
  ChevronRight 
} from 'lucide-react';

export function Features() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Tudo o que você precisa para gerir despesas</h2>
          <p className="text-slate-600">Simplicidade no uso, robustez no controle e transparência total para todos os envolvidos.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="Fluxo Ágil"
            description="Envie solicitações em segundos e acompanhe o status em tempo real sem burocracia."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Aprovações Seguras"
            description="Hierarquia de permissões clara para gestores e financeiro validarem cada centavo."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6" />}
            title="Relatórios Detalhados"
            description="Visão completa de gastos por categoria, período ou colaborador com um clique."
          />
          <FeatureCard 
            icon={<Clock className="w-6 h-6" />}
            title="Histórico Completo"
            description="Nunca perca o rastro de uma despesa. Auditoria completa e persistente."
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6" />}
            title="Multi-dispositivo"
            description="Acesse de qualquer lugar. Responsividade total para desktop, tablet e mobile."
          />
          <FeatureCard 
            icon={<ChevronRight className="w-6 h-6" />}
            title="E muito mais..."
            description="Filtros avançados, exportação de dados e integração com anexos em nuvem."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
