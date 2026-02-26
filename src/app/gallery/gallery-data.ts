/* ============================================================
   GALLERY DATA
   ============================================================
   HOW TO ADD PHOTOS:
   1. Add a new entry to `galleryPhotos` with the UploadThing URL
   2. Set `eventId` to match an id from `galleryEvents`
   3. Set `aspect` to match the photo's orientation:
      - "landscape"  →  wider than tall  (e.g. 4:3)
      - "portrait"   →  taller than wide (e.g. 3:4)
      - "square"     →  roughly equal sides
      - "wide"       →  very wide / panoramic (e.g. 16:9)

   HOW TO ADD A NEW EVENT:
   1. Add a new entry to `galleryEvents` with a unique id, label, and date
   2. Use that id as the `eventId` on any photos from that event
   ============================================================ */

export interface GalleryEvent {
  id: string;
  label: string;
  date: string;
}

export interface GalleryPhoto {
  id: number;
  src: string;
  eventId: string;
  aspect: "square" | "portrait" | "landscape" | "wide";
}

/* ------------------------------------------------------------
   EVENTS — add a new object here for each event
   ------------------------------------------------------------ */
export const galleryEvents: GalleryEvent[] = [
  {
    id: "disco-soulstice-launch",
    label: "Disco Soulstice Launch",
    date: "June 27, 2025",
  },
  {
    id: "disco-soulstice-district",
    label: "District Soulstice",
    date: "October 8, 2025",
  },
];

/* ------------------------------------------------------------
   PHOTOS — paste your UploadThing URLs here
   ------------------------------------------------------------ */
export const galleryPhotos: GalleryPhoto[] = [
  // ── Disco Soulstice Launch ───────────────────────────────────
  { id: 1, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokMBJn4sqFKobX2DzAfVrLNHZRiSP7a5y4ncJU", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 2, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f", eventId: "disco-soulstice-launch", aspect: "portrait"},
  { id: 3, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokvFFrOm290SMrqDBY3zxQvu6ft7G1iaIlLhKj", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 4, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok9kwlyFmz2kgQM7K1IFXubPNiOymdsJRZA9Sn", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 5, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokFEYjD0oRPEAvfsiCOeNQywlIXdUBb49cDG6j", eventId: "disco-soulstice-launch", aspect: "portrait"},
  { id: 6, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokEkuLXTZcVXUsunMJ76CAPSg1rhfKZczDj0FG", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 7, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokxzAF6bqmfRpOlavFNErkI9whLuXBn6GPoYy4", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 8, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokKFD5MeiYsE6FSdLpeqDilN1yX2KIJufBVox3", eventId: "disco-soulstice-launch", aspect: "portrait"},
  { id: 9, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokks4LsqRJ6EsF4dYlqASjN2MQy1mkVf0gw8Ka", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 10, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok95HcDfmz2kgQM7K1IFXubPNiOymdsJRZA9Sn", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 11, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok9dTFgmz2kgQM7K1IFXubPNiOymdsJRZA9Snw", eventId: "disco-soulstice-launch", aspect: "portrait"},
  { id: 12, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokDU9zARS7Dy56bY31Ux8ViTEpNJhdaHGKs2CI", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 13, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok4dxqf0HHdKv6aB2crAlwGYoFC7D4PNOpeZM1", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 14, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokkm43JZRJ6EsF4dYlqASjN2MQy1mkVf0gw8Ka", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 15, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok6zvaiu98eyEG7SjZPkbs0Ra9FMzlcKtDhmwr", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 16, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokSxgeGEv0lRYp2qGcWk5yzx43KbH7B1N8wdfS", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 17, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokk7WiHpRJ6EsF4dYlqASjN2MQy1mkVf0gw8Ka", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 18, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok2roStceuDrMPSZexgRzkFtwYBH347dQbKsVT", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 19, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokgsXOBkYqxPJWdQsLVmDiMreBHFt97UYK53Gu", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 20, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokQhFjrE3UmvX4T87oJkpyaY6jzGMbhKZHw0fF", eventId: "disco-soulstice-launch", aspect:"portrait"},
  { id: 21, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokiXR8OejOABjEPI8Sp0JHqy3T21szLFou6Wwm", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 22, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokjVvb9AKdcrOyYPEaZe3B9wAbN8lX71VF2tJW", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 23, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok5YtFagIqAkGmr9j61ZIRDxfwEa57VXUeshlY", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 24, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok9papv6Cmz2kgQM7K1IFXubPNiOymdsJRZA9S", eventId: "disco-soulstice-launch", aspect: "landscape"},
  { id: 25, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokS0m7nGv0lRYp2qGcWk5yzx43KbH7B1N8wdfS", eventId: "disco-soulstice-launch", aspect: "portrait"},
  { id: 26, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokcNpRawnKy6ZgONkpRHo50r1LMfhlsYe42QID", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 27, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokn4SxyWkSaVLokuwTj1K3FNbyZOr9eczJgvQH", eventId: "disco-soulstice-launch", aspect: "square"},
  { id: 28, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokGOgXMYuq7TeAhgIXO0NHWzpdl5i16CjEuSZQ", eventId: "disco-soulstice-launch", aspect:"portrait"},
  { id: 29, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokc31oAunKy6ZgONkpRHo50r1LMfhlsYe42QID", eventId:"disco-soulstice-launch", aspect:"square"},
  { id :30, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok1L2jsOAVmftNG5UZqwin4YuKFeH0IbvL9DPX", eventId:"disco-soulstice-launch", aspect:"landscape"},
  { id: 31, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok0YRj1OVAK4nLm2yTMzh9NuZsijPU1QWwHgc6", eventId: "disco-soulstice-launch", aspect: "square"},
  
  
  // ── District Soulstice ────────────
  { id: 32, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokdZIttW0WEKgyjcoitU9IHQb6TBa2wuGr8VhZ", eventId: "disco-soulstice-district", aspect: "square" },
  { id: 33, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokVYXvD8S6URwW5x0CStNZvzYJeIh4mOLf81Kc", eventId: "disco-soulstice-district", aspect: "landscape" },
  { id: 34, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokEMqsi2cVXUsunMJ76CAPSg1rhfKZczDj0FGI", eventId: "disco-soulstice-district", aspect: "portrait" },
  { id: 35, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokYooOQRDM8oM6uxipODeLBfKXsQGhVnarUjgJ", eventId: "disco-soulstice-district", aspect: "landscape" },
  { id: 36, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokYwteXYM8oM6uxipODeLBfKXsQGhVnarUjgJE", eventId: "disco-soulstice-district", aspect: "square" },
  { id: 37, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokTs0dMNQJuA96T2DW1tbyHYd0lfKx8znBs7cI", eventId: "disco-soulstice-district", aspect: "square" },
  { id: 38, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokReTq3ugRdE3eB4m9Uz8NacAhKbkoIGQCuVDO", eventId: "disco-soulstice-district", aspect: "portrait" },
  { id: 39, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokEOx1RVcVXUsunMJ76CAPSg1rhfKZczDj0FGI", eventId: "disco-soulstice-district", aspect: "square" },
  { id: 40, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokOxNcypNG7XSPjqVt1LrkcfA2eDawunBxdgIF", eventId: "disco-soulstice-district", aspect: "landscape" },
  { id: 41, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokERitwacVXUsunMJ76CAPSg1rhfKZczDj0FGI", eventId: "disco-soulstice-district", aspect: "square" },
  { id: 42, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokRu7paSgRdE3eB4m9Uz8NacAhKbkoIGQCuVDO", eventId: "disco-soulstice-district", aspect: "portrait" },
  { id: 43, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokZ1CECiByxPEJn84H6MBsi7wL5zOSdyvhet9I", eventId: "disco-soulstice-district", aspect: "square" },
  { id: 44, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokvdfXyO290SMrqDBY3zxQvu6ft7G1iaIlLhKj", eventId: "disco-soulstice-district", aspect: "landscape" },
  { id: 45, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLok0IOHq5VAK4nLm2yTMzh9NuZsijPU1QWwHgc6", eventId: "disco-soulstice-district", aspect: "portrait" },
  { id: 46, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokR1c79egRdE3eB4m9Uz8NacAhKbkoIGQCuVDO", eventId: "disco-soulstice-district", aspect: "square" },
  { id: 47, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokOW3Su2G7XSPjqVt1LrkcfA2eDawunBxdgIFb", eventId: "disco-soulstice-district", aspect: "landscape" },
  { id: 48, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokT5KlVJQJuA96T2DW1tbyHYd0lfKx8znBs7cI", eventId: "disco-soulstice-district", aspect: "portrait" },
  { id: 49, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokhaKQIBZZLz9lKi35nkrpTMI8atAcJGsU6hNO", eventId: "disco-soulstice-district", aspect: "square" },
  { id: 50, src: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokfuc3bYJoh9tDc6aW0ly2AngrXvwfP3TBNQiR", eventId: "disco-soulstice-district", aspect: "landscape" },

];
