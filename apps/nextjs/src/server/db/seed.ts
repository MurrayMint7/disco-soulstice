import { db } from "~/server/db";
import { events } from "~/server/db/schema";

async function main() {
  await db.insert(events).values([
    {
      title: "The Groove Assembly",
      slug: "the-groove-assembly",
      date: new Date("2026-04-03T16:00:00Z"),
      day: "Good Friday",
      time: "4:00 PM — 10:00 PM",
      venue: "Wakefield Exchange",
      location: "Union Street, WF1 3AD",
      description:
        "A crew of crate-diggers from Elliott's Bar's Vinyl Social night join Disco Soulstice, the party collective with a passion for good time, groove for a Good Friday event not to be missed. Expect to hear disco, funk, house and global groove from 4pm-10pm!",
      image:
        "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokTAI2x7QJuA96T2DW1tbyHYd0lfKx8znBs7cI",
      status: "free-event",
      priceInPence: null,
      totalTickets: null,
      maxPerOrder: 4,
    },
    {
      title: "Disco Soulstice's 1st Birthday",
      slug: "disco-soulstices-1st-birthday",
      date: new Date("2026-06-27T00:00:00Z"),
      day: "Saturday",
      time: "TBC",
      venue: "Melodie 71",
      location: "Kirkstall, LS5 3AT",
      description: "",
      image:
        "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f",
      status: "coming-soon",
      priceInPence: null,
      totalTickets: null,
      maxPerOrder: 4,
    },
  ]);
  console.log("Seeded events successfully");
}

main()
  .catch(console.error)
  .finally(() => process.exit());
