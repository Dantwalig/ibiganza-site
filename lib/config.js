// Everything you are likely to edit lives here (details, contact info, photos, notification emails).
// Page wording is in lib/content.js.
export const ORG = {
  name: "IBIGANZA",
  tagline: "Building confidence, preserving culture, inspiring purpose.",

  // Contact details shown on the site. Replace the bracketed placeholders.
  location: "[City], Rwanda",
  email: "[email@address]",
  phone: "[Phone number]",
  whatsapp: "[WhatsApp number]",
  // Example: { label: "Instagram", url: "https://instagram.com/yourpage" }
  social: [],

  // Everyone here gets an email for each new message. NOTIFY_EMAIL (comma separated) overrides this list.
  notifyEmails: [],
  // Replies from people who wrote to you go here. REPLY_TO_EMAIL overrides it.
  replyTo: "",

  // Options in the "Partnership interest" menu. The last one is the fallback.
  // These also become the filter tabs in the admin page.
  interests: [
    "Program partnership",
    "Institutional partnership",
    "Sponsorship",
    "Strategic and funding partnership",
    "Something else",
  ],

  // Photos: put files in /public/img and list them here, for example "/img/hero.jpg".
  // An empty value shows a placeholder block.
  images: {
    hero: "/img/hero.jpg",
    about: "/img/about.jpg",
    featured: "/img/featured.jpg",
    culture: "/img/culture.jpg",
    faith: "",
    why: "",
    stories: ["", "", ""],
    gallery: ["/img/gallery-1.jpg", "/img/gallery-2.jpg", "/img/gallery-3.jpg", "/img/gallery-4.jpg"],
  },
  // Short descriptions of each photo, read aloud by screen readers. Update them if you swap a photo.
  alts: {
    about: "Girls in green dresses and pearl necklaces dancing together",
    featured: "A speaker in traditional dress addressing a gathering",
    culture: "Three boys in traditional dance costume kneeling with arms outstretched",
    faith: "Young people gathered together",
    why: "A community moment",
    stories: ["Story photo", "Story photo", "Story photo"],
    gallery: [
      "Girls in green dresses posing in a dance",
      "Children dancing in front of a seated audience",
      "Three boys performing a traditional dance",
      "A speaker holding a microphone",
    ],
  },
};
