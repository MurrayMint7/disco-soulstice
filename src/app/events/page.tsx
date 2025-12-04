import { Header } from "../_components/header";

// Mock event data - replace with real data from your database later
const events = [
  {
    id: 1,
    title: "Summer Soulstice",
    date: "December 21, 2025",
    time: "8:00 PM - 2:00 AM",
    venue: "The Groove Palace",
    location: "Downtown Arts District",
    description: "Join us for the ultimate summer celebration! An evening of disco, funk, and soul music under the stars. Featuring live DJs, vintage vinyl sets, and a dance floor that never stops. Dress code: Your brightest disco attire.",
    image: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f",
  },
  {
    id: 2,
    title: "Velvet Nights",
    date: "January 15, 2026",
    time: "9:00 PM - 3:00 AM",
    venue: "The Gilded Ballroom",
    location: "Uptown Entertainment Complex",
    description: "An exclusive evening of sophistication and groove. Experience the golden age of disco with our curated selection of classic tracks and modern remixes. VIP tables available. Smart casual dress code with a touch of sparkle encouraged.",
    image: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f",
  },
  {
    id: 3,
    title: "Funk Factory",
    date: "February 8, 2026",
    time: "7:00 PM - 1:00 AM",
    venue: "The Warehouse",
    location: "Industrial Quarter",
    description: "Get ready to get funky! An underground party experience in a converted warehouse space. Raw, authentic, and absolutely groovy. Featuring guest DJs from around the globe spinning the best in funk, soul, and disco.",
    image: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f",
  },
  {
    id: 4,
    title: "Disco Wonderland",
    date: "March 14, 2026",
    time: "8:00 PM - 2:00 AM",
    venue: "Crystal Gardens",
    location: "Riverside Pavilion",
    description: "Step into a magical world where disco dreams come true. Immersive light installations, mirror balls galore, and non-stop dancing. A family-friendly early session followed by an adults-only late night extravaganza.",
    image: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f",
  },
  {
    id: 5,
    title: "Golden Hour Groove",
    date: "April 5, 2026",
    time: "6:00 PM - 12:00 AM",
    venue: "Sunset Terrace",
    location: "Hilltop Vista",
    description: "Watch the sun set while the beats rise. An outdoor disco experience with panoramic city views. Start your evening with sunset cocktails and end it on the dance floor under a canopy of stars and fairy lights.",
    image: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f",
  },
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-16 bg-gradient-to-b from-amber-950 via-orange-900/80 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-amber-100 tracking-wider drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
            UPCOMING EVENTS
          </h1>
          <p className="mt-4 text-xl text-amber-200/80 tracking-widest uppercase">
            Your one-stop destination for disco magic
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="relative py-16 px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} isReversed={index % 2 !== 0} />
          ))}
        </div>
      </section>
    </main>
  );
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  description: string;
  image: string;
}

function EventCard({ event, isReversed }: { event: Event; isReversed: boolean }) {
  return (
    <article 
      className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 group`}
    >
      {/* Image Box */}
      <div className="relative w-full md:w-1/2 aspect-[4/3] overflow-hidden rounded-lg shadow-xl">
        {/* Decorative border with glow */}
        <div className="absolute inset-0 border-2 border-amber-500/30 rounded-lg z-10 group-hover:border-amber-400/60 transition-all duration-500" />
        <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(251,191,36,0.2)] rounded-lg z-10 group-hover:shadow-[inset_0_0_50px_rgba(251,191,36,0.3)] transition-all duration-500" />
        
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Vintage overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-amber-900/20" />
      </div>

      {/* Text Content */}
      <div className={`w-full md:w-1/2 flex flex-col justify-center ${isReversed ? 'md:text-right' : 'md:text-left'}`}>
        {/* Date badge */}
        <div className={`flex items-center gap-2 mb-4 ${isReversed ? 'md:justify-end' : ''}`}>
          <span className="px-4 py-2 bg-amber-900/60 border border-amber-700/60 rounded-full text-amber-100 text-sm font-semibold tracking-wider uppercase">
            {event.date}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-wide group-hover:text-primary transition-colors duration-300">
          {event.title}
        </h2>

        {/* Venue & Time */}
        <div className={`flex flex-col gap-1 mb-6 text-muted-foreground ${isReversed ? 'md:items-end' : ''}`}>
          <p className="text-lg font-medium">{event.venue}</p>
          <p className="text-sm">{event.location}</p>
          <p className="text-sm text-amber-600 font-semibold mt-1">{event.time}</p>
        </div>

        {/* Description */}
        <p className="text-foreground/80 leading-relaxed mb-8">
          {event.description}
        </p>

        {/* CTA Button */}
        <div className={`${isReversed ? 'md:self-end' : 'md:self-start'}`}>
          <button className="relative px-8 py-3 bg-gradient-to-r from-amber-900 to-amber-700 text-white font-semibold tracking-wider uppercase rounded-lg overflow-hidden group/btn transition-all duration-300">
            <span className="relative z-10">Get Tickets</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-800 to-amber-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </article>
  );
}
