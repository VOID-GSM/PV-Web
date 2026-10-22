import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CalendarPage from "./pages/CalendarPage";
import { MainPage } from "./pages/MainPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import InvitePage from "./pages/InvitePage";
import SettingsPage from "./pages/SettingsPage";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { AddEventModal } from "./components/calendar/AddEventModal";
import type { CalendarEvent } from "./types/calendar";

export default function App() {
  const [currentMenu, setCurrentMenu] = useState<string>("통합 캘린더");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTaskCount = events.filter((e) => e.date === todayStr).length;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              {currentMenu === "오늘 할 일" && (
                <MainPage
                  events={events}
                  onNavigate={setCurrentMenu}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              )}

              {currentMenu === "통합 캘린더" && (
                <CalendarPage
                  events={events}
                  activeMenu={currentMenu}
                  onNavigate={setCurrentMenu}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onAddEvent={handleAddEvent}
                />
              )}

              {currentMenu === "활동" && (
                <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
                  <Sidebar
                    activeMenu={currentMenu}
                    todayTaskCount={todayTaskCount}
                    assignmentCount={0}
                    onNavigate={setCurrentMenu}
                  />
                  <div className="flex flex-1 flex-col overflow-y-auto">
                    <ActivityDetailPage />
                  </div>
                </div>
              )}

              {currentMenu !== "오늘 할 일" &&
                currentMenu !== "통합 캘린더" &&
                currentMenu !== "활동" && (
                  <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
                    <Sidebar
                      activeMenu={currentMenu}
                      todayTaskCount={todayTaskCount}
                      assignmentCount={0}
                      onNavigate={setCurrentMenu}
                    />
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <Header
                        title={currentMenu}
                        subtitle=""
                        onOpenAddModal={() => setIsAddModalOpen(true)}
                      />
                      <main className="flex-1 bg-white" />
                    </div>
                  </div>
                )}
            </>
          }
        />

        <Route path="/invite" element={<InvitePage />} />
        <Route path="/invite/:code" element={<InvitePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route
          path="/activity"
          element={
            <MainPage
              events={events}
              onNavigate={setCurrentMenu}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          }
        />

        <Route path="/activity/:id" element={<ActivityDetailPage />} />
      </Routes>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </BrowserRouter>
  );
}