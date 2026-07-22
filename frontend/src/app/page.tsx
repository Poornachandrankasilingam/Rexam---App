import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      <Hero />
      
      {/* Additional sections will be added here */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-muted-foreground border-t border-border">
        <p>© 2026 Rexam AI. Empowering Aspirants with Intelligence.</p>
      </div>
    </main>
  );
}
