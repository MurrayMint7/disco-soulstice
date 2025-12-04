import { Header } from "./_components/header";

const mockUrl = "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f";

export default async function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Section with Full-Screen Background */}
      <section className="relative w-full h-screen overflow-hidden">
        <img
          src={mockUrl}
          alt="Disco Soulstice"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Warm vintage overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-orange-900/20 to-amber-950/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="hero-title text-center text-amber-100 drop-shadow-[0_0_40px_rgba(251,191,36,0.5)]">
            DISCO SOULSTICE
          </h1>
        </div>
      </section>
    </main>
  );
}
