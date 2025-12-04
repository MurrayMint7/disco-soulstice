import { Header } from "./_components/header";

const mockUrl = "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokFTwOCRoRPEAvfsiCOeNQywlIXdUBb49cDG6j";

export default async function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Section*/}
      <section className="w-full overflow-hidden px-4 py-8">
        <h1 className="hero-title text-center text-primary">
          DISCO SOULSTICE
        </h1>
      </section>

      {/* Image Gallery Section */}
      <img
        src={mockUrl} 
        alt="Disco Soulstice" 
        className="mx-auto  w-200 h-100 object-cover hover:scale-105 transition-transform duration-500" 
      />
    </main>
  );
}
