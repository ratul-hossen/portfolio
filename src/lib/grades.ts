import type { GradeRecord } from "@/content/types";

/**
 * Cumulative GPA from per-term results. When every term has its credit
 * count the average is credit-weighted (how universities calculate CGPA);
 * otherwise each term counts equally.
 */
export function computeCgpa(grades: GradeRecord[]): number | null {
  if (!grades.length) return null;
  const weighted = grades.every((grade) => grade.credits && grade.credits > 0);
  const totalWeight = grades.reduce((sum, grade) => sum + (weighted ? grade.credits! : 1), 0);
  const total = grades.reduce((sum, grade) => sum + grade.gpa * (weighted ? grade.credits! : 1), 0);
  return Math.round((total / totalWeight) * 100) / 100;
}
