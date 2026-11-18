import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import logoWhite from "../assets/images/logo-white.png";
import linkIcon from "../assets/icons/link.svg";
import alertIcon from "../assets/icons/alert.svg";

import {
  GENERATION_OPTIONS,
  DEPARTMENT_OPTIONS,
  FEATURE_LIST,
} from "../constants/invite";
import {
  getInvite,
  createJoinRequest,
  reEntryLink,
  type InviteInfo,
} from "../api/authApi";
import { SelectionChip } from "../components/invite/SelectionChip";
import type { CalendarEvent } from "../types/calendar";

export interface InvitePageProps {
  events?: CalendarEvent[];
  activeMenu?: string;
  onNavigate?: (menu: string) => void;
  onOpenAddModal?: () => void;
  onAddEvent?: (newEvent: CalendarEvent) => void;
}

// ★ 카드 안 안내 상자 하나의 모양 (빨강: 실패 / 파랑: 안내)
type FormNotice = { type: "error" | "info"; text: string };

// ★ 에러를 안내 문구로 바꾸기 (Error면 그 메시지, 아니면 기본 문구)
const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

// ★ 입장에 성공하면 페이지를 새로 열며 이동한다
// (입장 화면에서는 토큰이 없어 일정·할 일을 못 불러온 상태라, 새 토큰으로 처음부터 다시 불러오게)
const goToMain = () => window.location.replace("/today");

const InvitePage: React.FC<InvitePageProps> = () => {
  const { code } = useParams<{ code: string }>();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isReEntryOpen, setIsReEntryOpen] = useState(false);
  const [reEntryCode, setReEntryCode] = useState("");
  const [isReEntering, setIsReEntering] = useState(false);
  // ★ 재입장 창 안에 띄울 실패 문구
  const [reEntryError, setReEntryError] = useState("");

  // ★ 카드 안 안내 상자 (null이면 안 보임)
  const [formNotice, setFormNotice] = useState<FormNotice | null>(null);

  const [name, setName] = useState("");
  const [generation, setGeneration] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);

  const [errors, setErrors] = useState({
    name: false,
    generation: false,
    departments: false,
  });

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    getInvite(code)
      .then((info) => {
        if (!cancelled) setInviteInfo(info);
      })
      .catch((error: unknown) => {
        console.error("초대 정보 조회 실패:", error);

        if (!cancelled) {
          // ★ alert → 카드 안 빨간 안내
          setFormNotice({
            type: "error",
            text: toErrorMessage(error, "초대 정보를 불러오지 못했습니다."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  const generationOptions =
    inviteInfo?.generations?.map((item) => `${item.number}기`) ??
    GENERATION_OPTIONS;

  const departmentOptions =
    inviteInfo?.majors?.map(
      (major) =>
        ({
          FRONTEND: "Front-end",
          BACKEND: "Back-end",
          DEVOPS: "DevOps",
          DESIGN: "Design",
        })[major],
    ) ?? DEPARTMENT_OPTIONS;

  const toggleGeneration = (item: string) => {
    setGeneration((prev) => (prev === item ? "" : item));
    setErrors((prev) => ({ ...prev, generation: false }));
  };

  const toggleDepartment = (department: string) => {
    setDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((item) => item !== department)
        : [...prev, department],
    );

    setErrors((prev) => ({ ...prev, departments: false }));
  };

  const handleSubmit = async () => {
    const nameError = name.trim() === "";
    const generationError = generation === "";
    const departmentsError = departments.length === 0;

    setErrors({
      name: nameError,
      generation: generationError,
      departments: departmentsError,
    });

    if (nameError || generationError || departmentsError) return;

    if (!code || !inviteInfo) {
      // ★ alert → 카드 안 빨간 안내
      setFormNotice({ type: "error", text: "유효한 초대 링크로 접속해 주세요." });
      return;
    }

    const selectedGeneration = inviteInfo.generations.find(
      (item) => `${item.number}기` === generation,
    );

    if (!selectedGeneration) {
      // ★ alert → 카드 안 빨간 안내
      setFormNotice({ type: "error", text: "초대 링크에서 제공한 기수를 선택해 주세요." });
      return;
    }

    const majorMap: Record<
      string,
      "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN"
    > = {
      "Front-end": "FRONTEND",
      "Back-end": "BACKEND",
      DevOps: "DEVOPS",
      Design: "DESIGN",
    };

    setIsSubmitting(true);
    // ★ 새로 보낼 때는 이전 안내를 지운다
    setFormNotice(null);

    try {
      const result = await createJoinRequest(code, {
        name: name.trim(),
        generationId: selectedGeneration.id,
        majors: departments
          .map((department) => majorMap[department])
          .filter(
            (major): major is "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN" =>
              Boolean(major),
          ),
      });

      localStorage.setItem("pvweb:memberId", String(result.memberId));

      if (result.accessToken) {
        localStorage.setItem("pvweb:accessToken", result.accessToken);
      }

      if (result.refreshToken) {
        localStorage.setItem("pvweb:refreshToken", result.refreshToken);
      }

      localStorage.setItem(
        "pvweb:invite-profile:v1",
        JSON.stringify({
          name: name.trim(),
          generation,
          departments,
          joinedAt: new Date().toISOString(),
        }),
      );

      if (result.status === "JOINED") {
        // ★ alert 없이 바로 이동
        goToMain();
      } else {
        // ★ alert → 카드 안 파란 안내
        setFormNotice({
          type: "info",
          text: "가입 요청을 보냈습니다. 팀 관리자의 승인을 기다려 주세요.",
        });
      }
    } catch (error) {
      console.error("초대 가입 요청 실패:", error);
      // ★ alert → 카드 안 빨간 안내
      setFormNotice({
        type: "error",
        text: toErrorMessage(error, "가입 요청을 보내지 못했습니다."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReEntry = async () => {
    const code = reEntryCode.trim();

    if (!code) {
      // ★ alert → 재입장 창 안 빨간 글씨
      setReEntryError("재입장 코드를 입력해 주세요.");
      return;
    }

    setIsReEntering(true);
    setReEntryError("");

    try {
      const result = await reEntryLink(code);
      localStorage.setItem("pvweb:memberId", String(result.memberId));

      if (result.accessToken) {
        localStorage.setItem("pvweb:accessToken", result.accessToken);
      }

      if (result.refreshToken) {
        localStorage.setItem("pvweb:refreshToken", result.refreshToken);
      }

      if (result.status === "JOINED") {
        // ★ alert 없이 바로 이동
        goToMain();
      } else {
        // ★ 창을 닫고 카드 안 파란 안내
        setIsReEntryOpen(false);
        setFormNotice({
          type: "info",
          text: "재입장 요청을 보냈습니다. 팀 관리자의 승인을 기다려 주세요.",
        });
      }
    } catch (error) {
      console.error("재입장 실패:", error);
      // ★ alert → 재입장 창 안 빨간 글씨
      setReEntryError(
        toErrorMessage(error, "재입장에 실패했습니다. 코드를 확인해 주세요."),
      );
    } finally {
      setIsReEntering(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#f7f7f7] font-pretendard">
      <div className="flex min-h-screen w-full">
        <section className="relative flex min-h-screen w-[41%] min-w-[560px] flex-col bg-black px-[6.5%] py-[5.5%] text-white">
          <div className="mb-[5%]">
            <img
              src={logoWhite}
              alt="VOID"
              className="h-auto w-[145px] object-contain"
            />
          </div>

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

          <div className="absolute bottom-[6%] left-[6.5%] right-[6.5%] rounded-[10px] bg-[#181818] px-5 py-4">
            <div className="flex items-center gap-3 text-[13px] text-[#777]">
              <img src={linkIcon} alt="" className="h-5 w-5" />

              <span>
                {inviteInfo?.teamName ?? "초대 링크 확인 중"} ·{" "}
                {inviteInfo
                  ? inviteInfo.approvalRequired
                    ? "관리자 승인 후 입장"
                    : "바로 입장 가능"
                  : "초대 정보를 불러오는 중입니다"}
              </span>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen flex-1 items-center justify-center bg-[#f7f7f7]">
          <div className="w-[520px] rounded-[18px] bg-white p-[44px] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <h2 className="text-[23px] font-bold tracking-[-0.03em]">
              프로필을 입력하고 입장하세요
            </h2>

            <p className="mt-2 text-[11px] text-[#999]">
              별도 로그인이 없습니다. 입장하면 이 기기에 인증 토큰이 저장돼요.
            </p>

            <div className="mt-8">
              <label className="text-[12px] font-medium">이름</label>

              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);

                  if (e.target.value.trim() !== "") {
                    setErrors((prev) => ({ ...prev, name: false }));
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

            <div className="mt-7 flex gap-3 rounded-[8px] bg-[#eaf3ff] px-4 py-4 text-[11px] leading-[1.5] text-[#4d78a8]">
              <img src={alertIcon} alt="" className="mt-[1px] h-4 w-4" />

              <p>
                입장하면 개인 초대장 코드가 발급됩니다. 기기를 바꿀 때 필요하니
                설정 화면에서 꼭 확인하세요.
              </p>
            </div>

            {/* ★ 실패·승인 대기 안내 상자 (alert 대신) */}
            {formNotice && (
              <p
                className={`mt-4 rounded-[8px] px-4 py-3 text-[12px] font-medium leading-[1.5] ${
                  formNotice.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-[#eaf3ff] text-[#4d78a8]"
                }`}
              >
                {formNotice.text}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-6 flex h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-black text-[13px] font-medium text-white transition hover:bg-[#222] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? "입장 중..." : "입장하기"}
              <span className="text-[17px]">→</span>
            </button>

            <div className="mt-5 text-center text-[10px] text-[#aaa]">
              <span>이미 입장한 적 있나요? </span>

              <button
                type="button"
                onClick={() => {
                  setReEntryCode("");
                  // ★ 창을 열 때 이전 실패 문구 지우기
                  setReEntryError("");
                  setIsReEntryOpen(true);
                }}
                className="cursor-pointer font-medium text-[#555] underline underline-offset-2"
              >
                재입장 코드 입력
              </button>
            </div>
          </div>
        </section>
      </div>

      {isReEntryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isReEntering) {
              setIsReEntryOpen(false);
            }
          }}
        >
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-xl font-bold">재입장 코드 입력</h2>

            <p className="mt-2 text-sm text-gray-500">
              발급받은 재입장 코드를 입력해 주세요.
            </p>

            <input
              autoFocus
              value={reEntryCode}
              onChange={(e) => {
                setReEntryCode(e.target.value);
                // ★ 다시 입력하면 실패 문구 지우기
                setReEntryError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isReEntering) {
                  void handleReEntry();
                }
              }}
              placeholder="재입장 코드"
              className={`mt-6 h-11 w-full rounded-lg border px-3 text-sm outline-none ${
                reEntryError
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black"
              }`}
            />

            {/* ★ 재입장 실패 문구 (alert 대신) */}
            {reEntryError && (
              <p className="mt-2 text-xs text-red-500">{reEntryError}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setIsReEntryOpen(false)}
                disabled={isReEntering}
                className="h-11 flex-1 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
              >
                취소
              </button>

              <button
                type="button"
                onClick={() => void handleReEntry()}
                disabled={isReEntering}
                className="h-11 flex-1 rounded-lg bg-black text-sm text-white disabled:opacity-50"
              >
                {isReEntering ? "재입장 중..." : "재입장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitePage;