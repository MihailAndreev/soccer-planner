import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { groupMembers, groups, matchComments, matchJoins, matches, users } from "./schema";

const SAMPLE_PASSWORD = "pass123";
const MATCH_TIME = "19:00:00";

const sampleUserEmails = [
  "steve@gmail.com",
  "peter@gmail.com",
  "dave@gmail.com",
  "john@gmail.com",
  "nick@gmail.com",
  ...Array.from({ length: 9 }, (_, index) => `user${index + 1}@gmail.com`),
];

const sampleGroupTitles = ["Sofia Derby", "Sunday Heroes"];

type SeedUser = {
  email: string;
  name: string;
  photoUrl: string;
};

type InsertedUser = typeof users.$inferSelect;
type InsertedGroup = typeof groups.$inferSelect;
type InsertedMatch = typeof matches.$inferSelect;

const seedUsers: SeedUser[] = sampleUserEmails.map((email) => {
  const localPart = email.split("@")[0] ?? email;
  const name = localPart.replace(/\d+$/, (value) => ` ${value}`);

  return {
    email,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    photoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(localPart)}`,
  };
});

function toDateString(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return date.toISOString().slice(0, 10);
}

function indexByEmail(insertedUsers: InsertedUser[]) {
  return new Map(insertedUsers.map((user) => [user.email, user]));
}

function indexByTitle(insertedGroups: InsertedGroup[]) {
  return new Map(insertedGroups.map((group) => [group.title, group]));
}

function requireMapValue<TKey, TValue>(map: Map<TKey, TValue>, key: TKey, label: string) {
  const value = map.get(key);

  if (!value) {
    throw new Error(`Missing ${label}: ${String(key)}`);
  }

  return value;
}

function selectHalfMembers(memberEmails: string[], rotation: number) {
  const rotated = [...memberEmails.slice(rotation), ...memberEmails.slice(0, rotation)];

  return rotated.slice(0, Math.ceil(memberEmails.length / 2));
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  const passwordHash = await bcrypt.hash(SAMPLE_PASSWORD, 10);

  await db.delete(groups).where(inArray(groups.title, sampleGroupTitles));
  await db.delete(users).where(inArray(users.email, sampleUserEmails));

  const insertedUsers = await db
    .insert(users)
    .values(seedUsers.map((user) => ({ ...user, passwordHash })))
    .returning();

  const userByEmail = indexByEmail(insertedUsers);

  const insertedGroups = await db
    .insert(groups)
    .values([
      {
        title: "Sofia Derby",
        description: "Competitive pickup matches for Sofia regulars.",
      },
      {
        title: "Sunday Heroes",
        description: "Friendly Sunday football for players around the city.",
      },
    ])
    .returning();

  const groupByTitle = indexByTitle(insertedGroups);
  const sofiaDerby = requireMapValue(groupByTitle, "Sofia Derby", "group");
  const sundayHeroes = requireMapValue(groupByTitle, "Sunday Heroes", "group");
  const numberedUsers = Array.from({ length: 9 }, (_, index) => `user${index + 1}@gmail.com`);
  const sofiaMembers = ["steve@gmail.com", "dave@gmail.com", "nick@gmail.com", ...numberedUsers];
  const sundayMembers = ["steve@gmail.com", "peter@gmail.com", "john@gmail.com", ...numberedUsers];

  await db.insert(groupMembers).values([
    ...sofiaMembers.map((email) => ({
      groupId: sofiaDerby.id,
      userId: requireMapValue(userByEmail, email, "user").id,
      isManager: email === "steve@gmail.com",
    })),
    ...sundayMembers.map((email) => ({
      groupId: sundayHeroes.id,
      userId: requireMapValue(userByEmail, email, "user").id,
      isManager: email === "steve@gmail.com" || email === "peter@gmail.com",
    })),
  ]);

  const insertedMatches = await db
    .insert(matches)
    .values([
      {
        groupId: sofiaDerby.id,
        matchDate: toDateString(3),
        matchTime: MATCH_TIME,
        location: "The School",
        capacity: 12,
      },
      {
        groupId: sofiaDerby.id,
        matchDate: toDateString(5),
        matchTime: MATCH_TIME,
        location: "Students Town",
        capacity: 12,
      },
      {
        groupId: sundayHeroes.id,
        matchDate: toDateString(6),
        matchTime: MATCH_TIME,
        location: "Arena 111",
        capacity: 10,
      },
      {
        groupId: sofiaDerby.id,
        matchDate: toDateString(-20),
        matchTime: MATCH_TIME,
        location: "Students Town",
        capacity: 12,
      },
      {
        groupId: sundayHeroes.id,
        matchDate: toDateString(-30),
        matchTime: MATCH_TIME,
        location: "Arena 111",
        capacity: 12,
      },
    ])
    .returning();

  const membershipByGroupId = new Map<number, string[]>([
    [sofiaDerby.id, sofiaMembers],
    [sundayHeroes.id, sundayMembers],
  ]);

  await db.insert(matchJoins).values(
    insertedMatches.flatMap((match, matchIndex) => {
      const memberEmails = requireMapValue(membershipByGroupId, match.groupId, "match members");
      const joiningEmails = selectHalfMembers(memberEmails, matchIndex);

      return joiningEmails.map((email, userIndex) => ({
        matchId: match.id,
        userId: requireMapValue(userByEmail, email, "user").id,
        extraSlots: userIndex % 5 === 0 ? 1 : 0,
      }));
    }),
  );

  const commentTemplates = [
    "I am in. Looking forward to a good game.",
    "Can bring one more player if we need numbers.",
    "Please confirm the pitch booking before kickoff.",
    "Great location for this one.",
    "I may be five minutes late, but I am coming.",
  ];

  await db.insert(matchComments).values(
    insertedMatches.flatMap((match, matchIndex) => {
      const memberEmails = requireMapValue(membershipByGroupId, match.groupId, "match members");
      const commentEmails = selectHalfMembers(memberEmails, matchIndex + 2).slice(0, 3);

      return commentEmails.map((email, commentIndex) => ({
        matchId: match.id,
        userId: requireMapValue(userByEmail, email, "user").id,
        text: commentTemplates[(matchIndex + commentIndex) % commentTemplates.length] ?? commentTemplates[0],
      }));
    }),
  );

  printSummary(insertedUsers, insertedGroups, insertedMatches);
}

function printSummary(
  insertedUsers: InsertedUser[],
  insertedGroups: InsertedGroup[],
  insertedMatches: InsertedMatch[],
) {
  console.log("Seed data inserted successfully.");
  console.log(`Users: ${insertedUsers.length}`);
  console.log(`Groups: ${insertedGroups.length}`);
  console.log(`Matches: ${insertedMatches.length}`);
}

main().catch((error) => {
  console.error("Seed failed:");
  console.error(error);
  process.exit(1);
});
