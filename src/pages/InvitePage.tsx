// src/pages/InvitePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logoWhite from "../assets/images/logo-white.png";
import linkIcon from "../assets/icons/link.svg";
import alertIcon from "../assets/icons/alert.svg";

import {
  GENERATION_OPTIONS,
  DEPARTMENT_OPTIONS,
  FEATURE_LIST,
} from "../constants/invite";
import { getInvite, createJoinRequest, type InviteInfo } from "../api/authApi";
import { SelectionChip } from "../components/invite/SelectionChip";
import type { CalendarEvent } from "../types/calendar";

export interface InvitePageProps {
  events?: CalendarEvent[];
  activeMenu?: string;
  onNavigate?: (menu: string) => void;
  onOpenAddModal?: () => void;
  onAddEvent?: (newEvent: CalendarEvent) => void;
}

const InvitePage: React.FC<InvitePageProps> = () => {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    getInvite(code)
      .then((info) => { if (!cancelled) setInviteInfo(info); })
      .catch((error: unknown) => {
        console.error("초대 정보 조회 실패:", error);
        if (!cancelled) alert(error instanceof Error ? error.message : "초대 정보를 불러오지 못했습니다.");
      });
    return () => { cancelled = true; };
  }, [code]);

  const generationOptions = inviteInfo?.generations?.map((item) => `${item.number}기`) ?? GENERATION_OPTIONS;
  const departmentOptions = inviteInfo?.majors?.map((major) => ({
    FRONTEND: "Front-end", BACKEND: "Back-end", DEVOPS: "DevOps", DESIGN: "Design",
  }[major])) ?? DEPARTMENT_OPTIONS;

  // 초기 선택값 비워두기 (이름, 기수, 전공)
  const [name, setName] = useState("");
  const [generation, setGeneration] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);

  const [errors, setErrors] = useState({
    name: false,
    generation: false,
    departments: false,
  });

  const toggleGeneration = (item: string) => {
    setGeneration((prev) => (prev === item ? "" : item));
    setErrors((prev) => ({
      ...prev,
      generation: false,
    }));
  };

  const toggleDepartment = (department: string) => {
    setDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((item) => item !== department)
        : [...prev, department],
    );

    setErrors((prev) => ({
      ...prev,
      departments: false,
    }));
  };

  const handleSubmit = async () => {
    const nameError = name.trim() === "";
    const generationError = generation === "";
    const departmentsError = departments.length === 0;
    setErrors({ name: nameError, generation: generationError, departments: departmentsError });
    if (nameError || generationError || departmentsError) return;
    if (!code || !inviteInfo) {
      alert("유효한 초대 링크로 접속해 주세요.");
      return;
    }
    const selectedGeneration = inviteInfo.generations.find((item) => `${item.number}기` === generation);
    if (!selectedGeneration) {
      alert("초대 링크에서 제공한 기수를 선택해 주세요.");
      return;
    }
    const majorMap: Record<string, "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN"> = {
      "Front-end": "FRONTEND", "Back-end": "BACKEND", DevOps: "DEVOPS", Design: "DESIGN",
    };
    setIsSubmitting(true);
    try {
      const result = await createJoinRequest(code, {
        name: name.trim(),
        generationId: selectedGeneration.id,
        majors: departments.map((department) => majorMap[department]).filter(
          (major): major is "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN" => Boolean(major),
        ),
      });
      localStorage.setItem("pvweb:memberId", String(result.memberId));
      if (result.accessToken) localStorage.setItem("pvweb:accessToken", result.accessToken);
      if (result.refreshToken) localStorage.setItem("pvweb:refreshToken", result.refreshToken);
      localStorage.setItem("pvweb:invite-profile:v1", JSON.stringify({
        name: name.trim(), generation, departments, joinedAt: new Date().toISOString(),
      }));
      if (result.status === "JOINED") {
        alert("팀 입장이 완료되었습니다.");
        navigate("/today");
      } else {
        alert("가입 요청을 보냈습니다. 팀 관리자의 승인을 기다려 주세요.");
      }
    } catch (error) {
      console.error("초대 가입 요청 실패:", error);
      alert(error instanceof Error ? error.message : "가입 요청을 보내지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f7f7] overflow-hidden font-pretendard">
      <div className="flex min-h-screen w-full">
        {/* =========================
            LEFT SECTION
        ========================= */}
        <section className="relative flex min-h-screen w-[41%] min-w-[560px] flex-col bg-black px-[6.5%] py-[5.5%] text-white">
          {/* Logo */}
          <div className="mb-[5%]">
            <img
              src={logoWhite}
              alt="VOID"
              className="h-auto w-[145px] object-contain"
            />
          </div>

          {/* Main text */}
          <div>
            <h1 className="text-[42px] font-bold leading-[1.35] tracking-[-0.04em]">
              까먹지 않게,
              <br />
              먼저 알려주는 팀 운영 도구
            </h1>

            <p className="mt-5 text-[15px] leading-[1.7] text-[#777]">
              일정 · 스터디 · 과제 · 기록을 한 곳에 모으고,
              <br />
              해야 할 사람에게 해야 할 타이밍에 먼저 알립니다.
            </p>
          </div>

          {/* Features list */}
          <div className="mt-[7%] space-y-7">
            {FEATURE_LIST.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#1d1d1d]">
                  <img src={feature.icon} alt="" className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-[16px] font-bold">{feature.title}</p>
                  <p className="mt-1 text-[12px] text-[#777]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Invite info */}
          <div className="absolute bottom-[6%] left-[6.5%] right-[6.5%] rounded-[10px] bg-[#181818] px-5 py-4">
            <div className="flex items-center gap-3 text-[13px] text-[#777]">
              <img src={linkIcon} alt="" className="h-5 w-5" />

              <span>
                {inviteInfo?.teamName ?? "초대 링크 확인 중"} ·{" "}
                {inviteInfo ? (inviteInfo.approvalRequired ? "관리자 승인 후 입장" : "바로 입장 가능") : "초대 정보를 불러오는 중입니다"}
              </span>
            </div>
          </div>
        </section>

        {/* =========================
            RIGHT SECTION
        ========================= */}
        <section className="relative flex min-h-screen flex-1 items-center justify-center bg-[#f7f7f7]">
          {/* Profile card */}
          <div className="h-[698px] w-[520px] rounded-[18px] bg-white p-[44px] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <h2 className="text-[23px] font-bold tracking-[-0.03em]">
              프로필을 입력하고 입장하세요
            </h2>
            <p className="mt-2 text-[11px] text-[#999]">
              별도 로그인이 없습니다. 입장하면 이 기기에 인증 토큰이 저장돼요.
            </p>

            {/* 이름 입력 */}
            <div className="mt-8">
              <label className="text-[12px] font-medium">이름</label>

              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);

                  if (e.target.value.trim() !== "") {
                    setErrors((prev) => ({
                      ...prev,
                      name: false,
                    }));
                  }
                }}
                className={`mt-2 h-[42px] w-full rounded-[7px] border px-3 text-[13px] outline-none ${
                  errors.name
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#999] focus:border-black"
                }`}
              />

              {errors.name ? (
                <p className="mt-2 text-[10px] text-red-500">
                  이름을 입력해주세요.
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-[#aaa]">
                  팀원에게 보이는 이름입니다
                </p>
              )}
            </div>

            {/* 기수 선택 */}
            <div className="mt-7">
              <label className="text-[12px] font-medium">기수</label>

              <div className="mt-3 flex gap-2">
                {generationOptions.map((item) => (
                  <SelectionChip
                    key={item}
                    label={item}
                    selected={generation === item}
                    onClick={() => toggleGeneration(item)}
                  />
                ))}
              </div>

              {errors.generation ? (
                <p className="mt-2 text-[10px] text-red-500">
                  기수를 선택해주세요.
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-[#aaa]">
                  기수 목록은 부장이 관리합니다
                </p>
              )}
            </div>

            {/* 전공 선택 */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium">전공</label>
                <span className="text-[10px] text-[#aaa]">복수 선택 가능</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {departmentOptions.map((department) => (
                  <SelectionChip
                    key={department}
                    label={department}
                    selected={departments.includes(department)}
                    onClick={() => toggleDepartment(department)}
                  />
                ))}
              </div>

              {errors.departments ? (
                <p className="mt-2 text-[10px] text-red-500">
                  전공을 하나 이상 선택해주세요.
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-[#aaa]">
                  과제 · 스터디 추천과 아바타 색상에 사용됩니다
                </p>
              )}
            </div>

            {/* Notice */}
            <div className="mt-7 flex gap-3 rounded-[8px] bg-[#eaf3ff] px-4 py-4 text-[11px] leading-[1.5] text-[#4d78a8]">
              <img src={alertIcon} alt="" className="mt-[1px] h-4 w-4" />

              <p>
                입장하면 개인 초대장 코드가 발급됩니다. 기기를 바꿀 때 필요하니
                설정 화면에서 꼭 확인하세요.
              </p>
            </div>

            {/* Enter Button */}
            <button
              type="button"
              onClick={handleSubmit} disabled={isSubmitting || !code || !inviteInfo}
              className="mt-6 flex h-[46px] w-full items-center justify-center gap-2 rounded-[7px] bg-black text-[13px] font-medium text-white transition hover:bg-[#222] active:scale-[0.99] cursor-pointer"
            >
              입장하기
              <span className="text-[17px]">→</span>
            </button>

            {/* Re-enter Button */}
            <div className="mt-5 text-center text-[10px] text-[#aaa]">
              <span>이미 입장한 적 있나요? </span>

              <button
                type="button"
                onClick={() => {
                  const saved = localStorage.getItem("pvweb:invite-profile:v1");
                  if (!saved) {
                    window.alert("저장된 프로필이 없습니다. 초대 API 연결 후 재입장을 사용할 수 있습니다.");
                    return;
                  }
                  try {
                    const profile = JSON.parse(saved) as { name?: string; generation?: string; departments?: string[] };
                    setName(profile.name ?? "");
                    setGeneration(profile.generation ?? "");
                    setDepartments(profile.departments ?? []);
                    window.alert("이 브라우저에 저장된 프로필을 불러왔습니다. 입장하기를 눌러 계속하세요.");
                  } catch {
                    window.alert("저장된 프로필을 읽을 수 없습니다. 정보를 다시 입력해 주세요.");
                  }
                }}
                className="font-medium text-[#555] underline underline-offset-2 cursor-pointer"
              >
                재입장 코드 입력
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InvitePage;
