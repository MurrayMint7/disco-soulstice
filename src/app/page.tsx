import { Header } from "./_components/header";

const mockUrl = "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokMBJn4sqFKobX2DzAfVrLNHZRiSP7a5y4ncJU";

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
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="hero-title text-center text-primary">
            DISCO SOULSTICE
          </h1>
        </div>
      </section>
    </main>
  );
}
