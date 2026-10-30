import { api } from "./client";
import type { Major } from "./interviews";

// 역량 항목 하나 (예: React 상태관리 / FRONTEND)
export interface Skill {
  id: number;
  major: Major;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
}

// 내 역량 점수 하나
export interface MySkillItem {
  skillId: number;
  major: Major;
  name: string;
  description: string | null;
  // 자가진단 점수 1~5 (아직 안 했으면 null)
  selfScore: number | null;
  assessedAt: string | null;
  // 이 역량으로 통과한 과제 수
  passedAssignmentCount: number;
}

// 내 역량 전체
export interface MySkills {
  memberId: number;
  name: string;
  generation: number;
  majors: Major[];
  skills: MySkillItem[];
}

// 역량 항목 목록 — GET /skills?major=
export const getSkills = async (major?: Major) => {
  const { data } = await api.get<Skill[]>("/skills", { params: { major } });
  return data;
};

// 역량 항목 추가 — POST /skills (부장만, 같은 전공+이름이면 409)
export const createSkill = async (body: { major: Major; name: string; description?: string }) => {
  const { data } = await api.post<Skill>("/skills", body);
  return data;
};

// 내 역량 점수 — GET /skills/me
export const getMySkills = async () => {
  const { data } = await api.get<MySkills>("/skills/me");
  return data;
};

// 자가진단 저장 — PATCH /skills/me (1~5점, 한 번에 여러 개)
export const saveMyScores = async (scores: { skillId: number; score: number }[]) => {
  const { data } = await api.patch<MySkills>("/skills/me", { scores });
  return data;
};
