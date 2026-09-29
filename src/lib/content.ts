// Single read API for all site content.
// Pages and components only use these functions, so swapping the storage
// (JSON file today, database later) doesn't touch them.

import type { JourneyItem, JourneyKind } from "@/content/types";
import { computeCgpa } from "./grades";
import { loadContent } from "./store";

/** Fills in the headline CGPA for degrees that list term results. */
function withCgpa(item: JourneyItem): JourneyItem {
  const cgpa = item.grades?.length ? computeCgpa(item.grades) : null;
  return cgpa === null ? item : { ...item, grade: `${cgpa.toFixed(2)} / 4.00 CGPA` };
}

export async function getProfile() {
  return (await loadContent()).profile;
}

export async function getJourney(kind?: JourneyKind) {
  const items = (await loadContent()).journey.map(withCgpa);
  return kind ? items.filter((item) => item.kind === kind) : items;
}

export async function getProjects() {
  return (await loadContent()).projects;
}

export async function getProject(slug: string) {
  return (await getProjects()).find((project) => project.slug === slug) ?? null;
}

export async function getSkills() {
  return (await loadContent()).skills;
}

export async function getResearch() {
  return (await loadContent()).research;
}

export async function getCanvas() {
  return (await loadContent()).canvas;
}

export async function getSettings() {
  return (await loadContent()).settings;
}

export async function getPublication(slug: string) {
  return (await getResearch()).publications.find((publication) => publication.slug === slug) ?? null;
}
