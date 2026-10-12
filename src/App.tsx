import { useState } from "react";
import CalendarPage from "./pages/CalendarPage";
import { MainPage } from "./pages/MainPage";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";

export default function App() {
  const [currentMenu, setCurrentMenu] = useState<string>("오늘 할 일");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

  return (
    <>
      {/* 1. 오늘 할 일 (메인 대시보드) */}
      {currentMenu === "오늘 할 일" && (
        <MainPage
          events={events}
          onNavigate={(menu: string) => setCurrentMenu(menu)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      )}

      {/* 2. 통합 캘린더 */}
      {currentMenu === "통합 캘린더" && (
        <CalendarPage
          events={events}
          activeMenu={currentMenu}
          onNavigate={(menu: string) => setCurrentMenu(menu)}