import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index.js";

config({ path: resolve(process.cwd(), ".env") });

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

const OWNER_ID = "edc7cb22-bd3b-4cef-b6b1-4d1c2c1c4911";

const categories = [
  "Humanitäre Hilfe (Ukraine)",
  "Natur- und Umweltschutz",
  "Bildung und Forschung",
  "Gesundheit und Medizin",
  "Soziale Gerechtigkeit",
  "Tier- und Artenschutz",
  "Kultur und Kunst",
  "Sport und Bewegung",
];

const statuses = [
  "PUBLISHED",
  "PUBLISHED",
  "PUBLISHED",
  "UNPUBLISHED",
  "DRAFT",
];

const countries = [
  "Germany",
  "Ukraine",
  "France",
  "Austria",
  "Switzerland",
  "Poland",
  "Netherlands",
];

const cities = {
  Germany: [
    "Berlin",
    "Hamburg",
    "Munich",
    "Cologne",
    "Frankfurt",
    "Stuttgart",
    "Düsseldorf",
  ],
  Ukraine: ["Kyiv", "Odesa", "Lviv", "Kharkiv", "Dnipro"],
  France: ["Paris", "Lyon", "Marseille"],
  Austria: ["Vienna", "Graz", "Salzburg"],
  Switzerland: ["Zurich", "Geneva", "Basel"],
  Poland: ["Warsaw", "Krakow", "Wroclaw"],
  Netherlands: ["Amsterdam", "Rotterdam", "The Hague"],
};

const initiatives = [
  {
    name: "Berlin Odessa Express",
    description: "Humanitarian aid delivery to Ukraine since 2022.",
  },
  {
    name: "Ride for Water, Ride for Life",
    description: "2,000 km bike tour raising funds for clean water access.",
  },
  {
    name: "Green Future Initiative",
    description: "Planting forests and restoring ecosystems across Europe.",
  },
  {
    name: "Education for All",
    description:
      "Providing school materials and scholarships to underprivileged children.",
  },
  {
    name: "Medical Aid Network",
    description:
      "Delivering critical medical supplies to underserved communities.",
  },
  {
    name: "Animal Rescue Alliance",
    description: "Rescuing and rehoming animals in crisis zones.",
  },
  {
    name: "Cultural Heritage Fund",
    description: "Preserving historic sites and cultural traditions.",
  },
  {
    name: "Youth Sports Program",
    description: "Empowering youth through sport and physical activity.",
  },
];

const projectNames = [
  "BerlinOdessaExpress",
  "Online Marketing Radtour",
  "Ride for Water, Ride for Life",
  "Ride for Water 2.0 Elbe to Edinburgh",
  "Green City Initiative Hamburg",
  "Solar Power for Rural Schools",
  "Clean Water for Kyiv Communities",
  "Digital Literacy for Seniors",
  "Food Bank Network Expansion",
  "Mental Health Support Hotline",
  "Refugee Integration Program Berlin",
  "Ocean Plastic Cleanup Campaign",
  "Wildlife Corridor Project",
  "Urban Beekeeping Initiative",
  "Community Garden Network",
  "Mobile Medical Clinic Ukraine",
  "Art Therapy for Trauma Survivors",
  "Bike to School Campaign Munich",
  "Emergency Housing for Flood Victims",
  "Youth Coding Bootcamp",
  "Sustainable Farming Co-op",
  "Library Rebuilding Project Kharkiv",
  "Street Children Support Center",
  "Elderly Care Home Renovation",
  "Women Entrepreneurship Fund",
  "Tree Planting Marathon Frankfurt",
  "Free Legal Aid Clinic",
  "Tech for Good Hackathon",
  "Music School for Disadvantaged Kids",
  "Neighborhood Safety Network",
  "Accessible Sports Equipment Drive",
  "Community Health Screening Program",
  "Zero Waste School Initiative",
  "Migrant Language Classes",
  "Emergency Medical Supplies Drive",
  "Pediatric Cancer Research Fund",
  "Urban Rewilding Berlin",
  "Homeless Shelter Winter Campaign",
  "Digital Inclusion for Elderly",
  "Clean Energy for Communities",
  "Cultural Exchange Youth Program",
  "Sustainable Fashion Workshop",
  "Coastal Erosion Protection",
  "Organic School Lunch Program",
  "Drone Aid Delivery Ukraine",
  "Mental Wellness App Development",
  "Solar Panels for Community Centers",
  "Literacy Program for Adults",
  "Emergency Response Training",
  "Cross-Border Solidarity Network",
];

const initiatorNames = [
  "David Juris",
  "Sanaz Yousef",
  "Maria Schmidt",
  "Klaus Weber",
  "Anna Müller",
  "Thomas Fischer",
  "Julia Becker",
  "Stefan Hoffmann",
  "Laura Braun",
  "Michael König",
];

const enterpriseNames = [
  null,
  null,
  "WE AID gGmbH",
  "Aktion Sühnezeichen",
  "Viva con Agua e.V.",
  "FRND – Freunde fürs Leben",
  null,
  "Deutsches Rotes Kreuz",
  null,
  "Greenpeace Deutschland",
];

const coverImages = [
  "https://weaidcoreprod.blob.core.windows.net/core-inputted/2638_Optimale%20Gr%C3%B6%C3%9Fe%20Titelbild%20BerlinOdessaExpress%20Initiative.png",
  "https://weaidcoreprod.blob.core.windows.net/core-inputted/0928_Optimal%20Gr%C3%B6%C3%9Fe%20Titelbild%20Online%20Marketing%20Radtour%202%20%282%29.png",
  "https://weaidcoreprod.blob.core.windows.net/core-inputted/0884_Optimal%20Gr%C3%B6%C3%9Fe%20Titelbild_Ride%20for%20Water.png",
  "https://weaidcoreprod.blob.core.windows.net/core-inputted/9253_Optimal%20Gr%C3%B6%C3%9Fe%20Titelbild_Ride%20for%20Water.png",
  "https://weaidcoreprod.blob.core.windows.net/core-inputted/5043_Optimale%20Gr%C3%B6%C3%9Fe%20Titelbild%20BerlinOdessaExpress%20Initiative.png",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDecimal(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function makeDescription(projectName) {
  return JSON.stringify({
    blocks: [
      {
        key: "seed01",
        text: `${projectName} is a community-driven initiative making a real difference. Join us in supporting this important cause.`,
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
    ],
    entityMap: {},
  });
}

async function seed() {
  console.log("Seeding 50 projects...");

  const records = projectNames.map((name, i) => {
    const country = pick(countries);
    const city = pick(cities[country]);
    const initiative = pick(initiatives);
    const status = pick(statuses);
    const targetAmount = randDecimal(5000, 150000);
    const totalDonation = randDecimal(0, parseFloat(targetAmount));
    const remainingBalance = (
      parseFloat(targetAmount) - parseFloat(totalDonation)
    ).toFixed(2);
    const enterpriseName = pick(enterpriseNames);
    const publishedAt =
      status !== "DRAFT"
        ? new Date(Date.now() - randInt(1, 365) * 86400000)
        : null;

    return {
      name,
      description: makeDescription(name),
      language: pick(["DE", "EN"]),
      categoryName: pick(categories),
      currency: "€",
      country,
      city,
      locationName: country,
      zipCode: String(randInt(10000, 99999)),
      initiativeName: initiative.name,
      initiativeDescription: initiative.description,
      initiativeCoverImage: pick(coverImages),
      coverImage: pick(coverImages),
      initiatorId: randInt(1, 200),
      initiatorName: pick(initiatorNames),
      enterpriseId: enterpriseName ? randInt(1, 50) : 0,
      enterpriseName: enterpriseName ?? null,
      targetAmount,
      totalDonation,
      remainingBalance,
      feeValue: pick(["5.00", "3.50", "0.00", "7.50"]),
      projectFeeType: pick(["PERCENTAGE", "FIXED"]),
      projectStatus: status,
      emergency: Math.random() < 0.1,
      anonymized: false,
      adminModifiedFee: false,
      emergencySetByAdmin: false,
      revisionExists: Math.random() < 0.3,
      listOfObjections: [],
      publishedAt,
      ownerId: OWNER_ID,
    };
  });

  await db.insert(schema.projects).values(records);
  console.log(`Seeded ${records.length} projects successfully.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
