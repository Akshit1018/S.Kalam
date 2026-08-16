import { addDays, format, getISOWeek, getISOWeekYear, startOfDay, subDays } from "date-fns";
import type { Note } from "./types";

function at(daysAgo: number, hour = 9): number {
  const d = startOfDay(subDays(new Date(), daysAgo));
  d.setHours(hour, 12, 0, 0);
  return d.getTime();
}

export const SEED_IDS = {
  welcome: "note-welcome",
  markdown: "note-markdown",
  terrace: "note-terrace",
  reading: "note-reading",
  recipe: "note-recipe",
  meeting: "note-meeting",
  quick: "note-quick",
  archived: "note-archived",
} as const;

export function dailyTitle(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function weeklyTitle(date: Date): string {
  const year = getISOWeekYear(date);
  const week = String(getISOWeek(date)).padStart(2, "0");
  return `${year}-W${week}`;
}

export function buildDailyNote(date: Date, extras?: Partial<Note>): Note {
  const title = dailyTitle(date);
  const weekday = format(date, "EEEE");
  const pretty = format(date, "MMMM d");
  return {
    id: `daily-${title}`,
    title,
    folder: "daily",
    status: "active",
    pinned: false,
    createdAt: date.getTime(),
    updatedAt: date.getTime(),
    content: `# ${weekday}, ${pretty}

## Morning
- [ ] Open the terrace door
- [ ] One line before the phone

## Notes


## Evening
- [ ] What stayed with me
`,
    ...extras,
  };
}

export function buildWeeklyNote(date: Date): Note {
  const title = weeklyTitle(date);
  return {
    id: `weekly-${title}`,
    title,
    folder: "weekly",
    status: "active",
    pinned: false,
    createdAt: date.getTime(),
    updatedAt: date.getTime(),
    content: `# Week ${title}

## Focus
- [ ] Keep the daily page honest
- [ ] Finish the terrace sketch

## Wins


## Carry over

`,
  };
}

export function seedNotes(now = new Date()): Note[] {
  const today = buildDailyNote(now, {
    content: `# ${format(now, "EEEE, MMMM d")}

Cooler on the terrace before the sun clears the east wall.

## Morning
- [ ] Water the tulsi
- [ ] Reply to Anil about Saturday
- [ ] One honest line here

## Notes
Opened [[Welcome to Kalam]] and left the phone downstairs. The idea is still the same: a page you own.

Linked from [[Reading list]].

## Evening
- [ ] What stayed with me
`,
    updatedAt: now.getTime(),
  });

  const yesterday = buildDailyNote(addDays(now, -1), {
    content: `# ${format(addDays(now, -1), "EEEE, MMMM d")}

Walked to the circle after five. Bought coriander and two limes.

## Morning
- [x] Water the tulsi
- [x] Stretch
- [ ] Call the nursery

## Notes
Pink light on the neem. Added a bed to [[Terrace garden]].

## Evening
- [x] What stayed with me
`,
  });

  const twoDays = buildDailyNote(addDays(now, -2), {
    content: `# ${format(addDays(now, -2), "EEEE, MMMM d")}

Worked on the editor toolbar until late. Suggestions can wait until the page is true.

- [x] Seed a real vault
- [x] Check preview on a phone
- [ ] Write the weekly note
`,
  });

  const threeDays = buildDailyNote(addDays(now, -3), {
    content: `# ${format(addDays(now, -3), "EEEE, MMMM d")}

Rest day. Cooked [[Nimbu rice]] and read on the floor.

- [x] Groceries
- [x] Laundry
`,
  });

  return [
    {
      id: SEED_IDS.welcome,
      title: "Welcome to Kalam",
      folder: "inbox",
      status: "active",
      pinned: true,
      createdAt: at(12, 8),
      updatedAt: at(0, 18),
      content: `# Welcome to Kalam

A private notebook. Every page is Markdown you own.

**Kalam** means pen. The plus button fans out New, Search, Browse, and More. The sparkle on a page asks the pen to continue, tighten, title, tag, or propose next steps. Nothing is sent until you tap.

## Move around
- Menu opens the vault
- Today is always one tap
- Tasks collects every \`- [ ]\`
- Command palette: the command icon, or \`⌘K\`
- Long-press plus for a quick capture — then expand it if you want

## Try a link
Open [[Markdown kitchen sink]] for callouts and tables. The plants live in [[Terrace garden]].

#kalam #getting-started
`,
    },
    {
      id: SEED_IDS.markdown,
      title: "Markdown kitchen sink",
      folder: "inbox",
      status: "active",
      pinned: false,
      createdAt: at(10, 11),
      updatedAt: at(1, 16),
      content: `# Markdown kitchen sink

GitHub-flavored Markdown. Preview is part of the work, not a separate product.

> [!NOTE]
> Callouts use \`> [!NOTE]\`. Also: TIP, WARNING, IMPORTANT.

## Emphasis
Regular paragraph with **bold**, *italic*, ~~strike~~, and \`inline code\`. A wiki link to [[Welcome to Kalam]] and a missing one to [[Someday maybe]].

## Tasks
- [x] Render headings and lists
- [x] Wiki links
- [ ] Try the sparkle menu
- [ ] Toggle a checkbox in preview

## Table

| View | Holds |
| --- | --- |
| Home | Today, hints, pinned |
| Browse | Inbox, projects, quick |
| Daily | ISO date pages |
| Tasks | Checkboxes from every note |

## Code

\`\`\`ts
function openDaily(date: Date) {
  return format(date, "yyyy-MM-dd");
}
\`\`\`

> Keep the notes as ordinary files. Everything else is a lens.

#markdown #reference
`,
    },
    {
      id: SEED_IDS.terrace,
      title: "Terrace garden",
      folder: "projects",
      status: "active",
      pinned: true,
      createdAt: at(20, 7),
      updatedAt: at(1, 19),
      content: `# Terrace garden

West sun after three. Morning shade from the neem.

## Beds
- **North wall** — tulsi, mint, leftover coriander
- **Rail** — bougainvillea
- **Pots** — desert rose, one tired jade

## This month
- [x] Repot the jade
- [ ] Ask the nursery about a second desert rose
- [ ] Mix sand into the tulsi pot
- [ ] Sketch a drip from the tap

Related: today's page, and [[Nimbu rice]].

#garden #home
`,
    },
    {
      id: SEED_IDS.reading,
      title: "Reading list",
      folder: "inbox",
      status: "active",
      pinned: false,
      createdAt: at(30, 21),
      updatedAt: at(2, 22),
      content: `# Reading list

What is open on the desk.

## Now
- *A Pattern Language* — seats in the sun
- Local-first essays (Ink & Switch)

## Next
- [ ] Calvino, *Invisible Cities*
- [ ] Something on monsoon houses
- [ ] Finish the help note

Pulled a line into [[Welcome to Kalam]].

#reading
`,
    },
    {
      id: SEED_IDS.recipe,
      title: "Nimbu rice",
      folder: "inbox",
      status: "active",
      pinned: false,
      createdAt: at(8, 13),
      updatedAt: at(3, 20),
      content: `# Nimbu rice

For evenings when the coriander is still standing.

## For two
- 1 cup rice, cooked and cooled
- Juice of two limes
- Mustard seed, turmeric, a dried chilli
- Curry leaves if you have them

## Method
1. Temper mustard in ghee until it pops
2. Turmeric, chilli, leaves — ten seconds
3. Fold through rice with lime and salt

#cooking
`,
    },
    {
      id: SEED_IDS.meeting,
      title: "Saturday — Anil",
      folder: "projects",
      status: "active",
      pinned: false,
      createdAt: at(4, 15),
      updatedAt: at(0, 10),
      content: `# Saturday — Anil

Before he leaves for Udaipur.

## Bring
- [ ] Bed map from [[Terrace garden]]
- [ ] Extra mint if it survived
- [ ] The library card

## Talk about
- Shared nursery order
- Whether the weekly note is worth it

#people
`,
    },
    {
      id: SEED_IDS.quick,
      title: "Tap washer",
      folder: "quick",
      status: "active",
      pinned: false,
      createdAt: at(0, 7),
      updatedAt: at(0, 7),
      content: `Hardware shop near the circle still has the rubber ones. Drip is back.

#errands
`,
    },
    {
      id: SEED_IDS.archived,
      title: "Old packing list",
      folder: "inbox",
      status: "archived",
      pinned: false,
      createdAt: at(60, 9),
      updatedAt: at(40, 9),
      content: `# Old packing list

Kept for the shape.

- [x] Light shawl
- [x] Charger
- [ ] The book I did not open
`,
    },
    today,
    yesterday,
    twoDays,
    threeDays,
    buildWeeklyNote(now),
  ];
}
