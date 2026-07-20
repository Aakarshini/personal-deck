import React, { useState } from "react";
import { Droplets, Dumbbell, Utensils, Plus, Minus, CheckCircle2, Circle } from "lucide-react";
import { load, save, todayStr } from "./storage.js";
import { display, mono, gradientIconStyle, gradientBarStyle } from "./theme.js";

const WATER_TARGET = 8;

function WaterTracker() {
  const [log, setLog] = useState(() => load("pers-health-water", {}));
  const today = todayStr();
  const count = log[today] || 0;

  const update = (delta) => {
    const next = { ...log, [today]: Math.max(0, Math.min(20, count + delta)) };
    setLog(next);
    save("pers-health-water", next);
  };

  const pct = Math.min(100, Math.round((count / WATER_TARGET) * 100));

  return (
    <div className="bg-[#241B3A] border border-[#3A2E58] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={gradientIconStyle}>
          <Droplets size={17} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-[15px]" style={display}>Water</h3>
          <p className="text-[#9B8FC0] text-xs mt-0.5"><span style={mono}>{count}/{WATER_TARGET}</span> glasses today</p>
        </div>
      </div>
      <div className="w-full h-2 bg-[#170F29] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, ...gradientBarStyle }} />
      </div>
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => update(-1)} className="w-9 h-9 rounded-full bg-[#170F29] border border-[#3A2E58] flex items-center justify-center text-white hover:border-pink-400">
          <Minus size={15} />
        </button>
        <span className="text-2xl font-bold text-white w-10 text-center" style={display}>{count}</span>
        <button onClick={() => update(1)} className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={gradientIconStyle}>
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

function GymTracker() {
  const [log, setLog] = useState(() => load("pers-health-gym", {}));

  // current week, Monday-first
  const weekDates = (() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  })();

  const toggle = (date) => {
    const entry = log[date] || { done: false, note: "" };
    const next = { ...log, [date]: { ...entry, done: !entry.done } };
    setLog(next);
    save("pers-health-gym", next);
  };

  const setNote = (date, note) => {
    const entry = log[date] || { done: false, note: "" };
    const next = { ...log, [date]: { ...entry, note } };
    setLog(next);
    save("pers-health-gym", next);
  };

  const doneCount = weekDates.filter((d) => log[d]?.done).length;
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-[#241B3A] border border-[#3A2E58] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={gradientIconStyle}>
          <Dumbbell size={17} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-[15px]" style={display}>Gym</h3>
          <p className="text-[#9B8FC0] text-xs mt-0.5"><span style={mono}>{doneCount}/7</span> days this week</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {weekDates.map((date, i) => {
          const entry = log[date] || { done: false, note: "" };
          const isToday = date === todayStr();
          return (
            <div key={date} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${isToday ? "bg-pink-500/5 border border-pink-500/30" : ""}`}>
              <button onClick={() => toggle(date)} className="shrink-0">
                {entry.done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} className="text-[#4d3d75]" />}
              </button>
              <span className="text-xs text-[#9B8FC0] w-8 shrink-0">{labels[i]}</span>
              <input
                value={entry.note}
                onChange={(e) => setNote(date, e.target.value)}
                placeholder="Workout…"
                className="flex-1 bg-transparent text-xs text-[#E4DEF5] placeholder-[#6E6191] outline-none min-w-0"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner", "Snacks"];

function DietTracker() {
  const [log, setLog] = useState(() => load("pers-health-diet", {}));
  const today = todayStr();
  const entry = log[today] || {};

  const update = (slot, field, value) => {
    const next = {
      ...log,
      [today]: { ...entry, [slot]: { ...(entry[slot] || {}), [field]: value } },
    };
    setLog(next);
    save("pers-health-diet", next);
  };

  const doneCount = MEAL_SLOTS.filter((s) => entry[s]?.done).length;

  return (
    <div className="bg-[#241B3A] border border-[#3A2E58] rounded-2xl p-5 flex flex-col gap-4 md:col-span-2">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={gradientIconStyle}>
          <Utensils size={17} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-[15px]" style={display}>Diet</h3>
          <p className="text-[#9B8FC0] text-xs mt-0.5"><span style={mono}>{doneCount}/{MEAL_SLOTS.length}</span> meals logged today</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MEAL_SLOTS.map((slot) => {
          const meal = entry[slot] || { done: false, text: "" };
          return (
            <div key={slot} className="bg-[#170F29] border border-[#3A2E58] rounded-lg px-3 py-2.5 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <button onClick={() => update(slot, "done", !meal.done)} className="shrink-0">
                  {meal.done ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Circle size={15} className="text-[#4d3d75]" />}
                </button>
                <span className="text-xs font-medium text-[#C9C1E0]">{slot}</span>
              </div>
              <input
                value={meal.text}
                onChange={(e) => update(slot, "text", e.target.value)}
                placeholder="What did you eat?"
                className="bg-transparent text-xs text-[#E4DEF5] placeholder-[#6E6191] outline-none border-t border-[#3A2E58] pt-1.5"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HealthPlanPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-white" style={display}>Health Plan</h2>
        <p className="text-[#9B8FC0] text-xs mt-0.5">Water, workouts, and meals</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WaterTracker />
        <GymTracker />
        <DietTracker />
      </div>
    </div>
  );
}
