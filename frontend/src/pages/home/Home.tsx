import { Navbar } from '@/components/ui/home/Navbar';
import { Hero } from '@/components/ui/home/Hero';
import { Features } from '@/components/ui/home/Features';
import { Footer } from '@/components/ui/home/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/10">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
