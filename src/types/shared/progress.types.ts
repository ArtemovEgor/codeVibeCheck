export interface ISkillData {
  type: SkillType;
  currentXP: number;
  totalXP: number;
  percentage: number;
}

export const SKILL_TYPES = {
  THEORY: "theory",
  CODING: "coding",
  LOGIC: "logic",
} as const;

export type SkillType = (typeof SKILL_TYPES)[keyof typeof SKILL_TYPES];

export interface IProgressStatistic {
  skillsMastery: ISkillData[];
}
