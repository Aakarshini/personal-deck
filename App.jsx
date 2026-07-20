import React, { useState } from "react";
import { Sparkles, ListChecks, BookOpen, HeartPulse, StickyNote, Bell, Calendar } from "lucide-react";
import TasksPanel from "./TasksPanel.jsx";
import StudyPlanPanel from "./StudyPlanPanel.jsx";
import HealthPlanPanel from "./HealthPlanPanel.jsx";
import NotesPanel from "./NotesPanel.jsx";
import { display, gradientIconStyle } from "./theme.js";

const NAV_ITEMS = [
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "study", label: "Study Plan", icon: BookOpen },
  { id: "health", label: "Health Plan", icon: HeartPulse },
  { id: "notes", label: "Notes", icon: StickyNote },
];

export default function App() {
  const [active, setActive] = useState("tasks");
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen w-full text-white" style={{ fontFamily: "'Inter', sans-serif", background: "#170F29" }}>
      {/* top bar */}
      <div
        className="w-full px-5 md:px-8 py-4 flex items-center justify-between border-b border-[#3A2E58]"
        style={{ background: "linear-gradient(90deg, #1D1533, #241B3A)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={gradientIconStyle}>
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight" style={display}>Personal Deck</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#2A1B0A]"
            style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)" }}
          >
            <Sparkles size={12} /> PERSONAL
          </div>
          <button className="w-9 h-9 rounded-full bg-[#241B3A] border border-[#3A2E58] flex items-center justify-center text-[#9B8FC0] hover:text-white transition">
            <Bell size={15} />
          </button>
          <button className="w-9 h-9 rounded-full bg-[#241B3A] border border-[#3A2E58] flex items-center justify-center text-[#9B8FC0] hover:text-white transition">
            <Calendar size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* sidebar */}
        <div className="lg:w-56 shrink-0 px-5 md:px-8 lg:px-4 py-5">
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    isActive ? "text-white" : "text-[#9B8FC0] hover:text-white hover:bg-[#241B3A]"
                  }`}
                  style={isActive ? { background: "linear-gradient(135deg, #EC4899, #A855F7)" } : {}}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* main content */}
        <div className="flex-1 min-w-0 px-5 md:px-8 py-5">
          <div className="mb-4">
            <span className="text-[#6E6191] text-xs uppercase tracking-widest">{today}</span>
          </div>
          {active === "tasks" && <TasksPanel />}
          {active === "study" && <StudyPlanPanel />}
          {active === "health" && <HealthPlanPanel />}
          {active === "notes" && <NotesPanel />}
        </div>
      </div>
    </div>
  );
}
