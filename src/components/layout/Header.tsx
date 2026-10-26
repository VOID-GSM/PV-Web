// src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import bellIcon from "../../assets/icons/bell.svg";
import plusIcon from "../../assets/icons/plus.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import bookIcon from "../../assets/icons/book.svg";
import fileTextIcon from "../../assets/icons/file-text.svg";
import clipboardIcon from "../../assets/icons/clipboard.svg";
import micIcon from "../../assets/icons/mic.svg";

import CreateActivityModal from "../modals/CreateActivityModal";
import CreateNoticeModal from "../modals/CreateNoticeModal";
import CreateArticleModal from "../modals/CreateArticleModal";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenAddModal?: () => void;
}

interface OutletContextType {
  onOpenAddModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenAddModal,
}) => {
  const outletContext = useOutletContext<OutletContextType | null>();
  const handleAddModal = onOpenAddModal || outletContext?.onOpenAddModal;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [activeNoticeTab, setActiveNoticeTab] = useState<
    "전체" | "안 읽음" | "멘션"
  >("전체");

  // 모달 제어 상태
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articleModalMode, setArticleModalMode] = useState<
    "article" | "assignment" | "journal" | "interview"
  >("article");

  const notifications: [] = [];

  const noticeRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (noticeRef.current && !noticeRef.current.contains(e.target as Node)) {
        setIsNoticeOpen(false);
      }
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setIsCreateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-8 select-none shrink-0 relative font-pretendard">
        <div>
          <h1 className="text-base font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* 알림 버튼 및 드롭다운 */}
          <div className="relative" ref={noticeRef}>
            <button
              type="button"
              onClick={() => {
                setIsNoticeOpen(!isNoticeOpen);
                setIsCreateOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-50 transition cursor-pointer relative"
            >
              <img src={bellIcon} alt="알림" className="h-4 w-4 opacity-60" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {isNoticeOpen && (
              <div className="absolute right-0 mt-3 w-96 rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">알림</h3>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      안 읽음 {notifications.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    모두 읽음
                  </button>
                </div>

                <div className="flex border-b border-gray-100 pb-1 pt-2 gap-4 text-xs font-semibold text-gray-400">
                  {(["전체", "안 읽음", "멘션"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveNoticeTab(tab)}
                      className={`pb-2 relative cursor-pointer ${
                        activeNoticeTab === tab
                          ? "text-gray-900 font-bold border-b-2 border-black"
                          : "hover:text-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="py-8 text-center text-xs text-gray-400">
                  <p>새로운 알림이 없습니다.</p>
                </div>
              </div>
            )}
          </div>

          {/* 새로 만들기 버튼 및 드롭다운 */}
          <div className="relative" ref={createRef}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(!isCreateOpen);
                setIsNoticeOpen(false);
              }}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-black px-4 text-xs font-bold text-white hover:bg-gray-800 transition cursor-pointer shadow-xs"
            >
              <img
                src={plusIcon}
                alt=""
                className="h-3.5 w-3.5 filter invert"
              />
              <span>새로 만들기</span>
            </button>

            {isCreateOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-gray-100 bg-white p-3 shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-xs">
                <div>
                  <p className="px-3 py-1 text-[10px] font-semibold text-gray-400">
                    새로 만들기
                  </p>
                  <div className="space-y-0.5 mt-1">
                    {/* ① 일정 추가 */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        if (handleAddModal) handleAddModal();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <img
                        src={calendarIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>일정 추가</span>
                    </button>

                    {/* ② 활동 개설 */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setIsActivityModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <img
                        src={bookIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>활동 개설</span>
                    </button>

                    {/* ③ 공지 보내기 */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setIsNoticeModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <img
                        src={bellIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>공지 보내기</span>
                    </button>

                    {/* ④ 과제 출제 */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setArticleModalMode("assignment");
                        setIsArticleModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <img
                        src={fileTextIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>과제 출제</span>
                    </button>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <p className="px-3 py-1 text-[10px] font-semibold text-gray-400">
                    내 기록
                  </p>
                  <div className="space-y-0.5 mt-1">
                    {/* ⑤ 정리글 작성 */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setArticleModalMode("article");
                        setIsArticleModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <img
                        src={fileTextIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>정리글 작성</span>
                    </button>

                    {/* ⑥ 업무일지 쓰기 (수정: 업무일지 모달 연결) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setArticleModalMode("journal");
                        setIsArticleModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <img
                        src={clipboardIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>업무일지 쓰기</span>
                    </button>

                    {/* ⑦ 면접 답변 남기기 (수정: 면접 답변 모달 연결) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setArticleModalMode("interview");
                        setIsArticleModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <img
                        src={micIcon}
                        alt=""
                        className="h-4 w-4 opacity-70"
                      />
                      <span>면접 답변 남기기</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 연동된 모달 */}
      <CreateActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />
      <CreateNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
      />
      <CreateArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        mode={articleModalMode}
      />
    </>
  );
};
