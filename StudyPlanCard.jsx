import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, CheckCircle2, Circle, BookOpen } from "lucide-react";
import { STUDY_SESSIONS } from "./studyPlanData.js";

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("storage save failed", e);
  }
};
const uid = () => Math.random().toString(36).slice(2, 10);
const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Poppins', sans-serif" };
const todayStr = () => new Date().toISOString().slice(0, 10);

const typeColors = {
  Theory: "bg-blue-500/15 text-blue-300",
  Practical: "bg-emerald-500/15 text-emerald-300",
  Review: "bg-amber-500/15 text-amber-300",
  Project: "bg-fuchsia-500/15 text-fuchsia-300",
  Practice: "bg-emerald-500/15 text-emerald-300",
  Reflection: "bg-amber-500/15 text-amber-300",
  Milestone: "bg-fuchsia-500/15 text-fuchsia-300",
  Action: "bg-blue-500/15 text-blue-300",
};

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function SessionRow({ session, state, onToggleDone, onAddSubtask, onToggleSubtask, onRemoveSubtask }) {
  const [open, setOpen] = useState(false);
  const [subtaskText, setSubtaskText] = useState("");
  const subtasks = state.subtasks || [];
  const hasSubtasks = subtasks.length > 0;
  const done = hasSubtasks ? subtasks.every((s) => s.done) : !!state.done;
  const isToday = session.date === todayStr();
  const isOverdue = !done && session.date < todayStr();

  const addSubtask = () => {
    if (!subtaskText.trim()) return;
    onAddSubtask(session.id, subtaskText.trim());
    setSubtaskText("");
  };

  return (
    <div className={`rounded-lg border ${isToday ? "border-pink-500/50 bg-pink-500/5" : "border-[#3A2E58]"} ${done ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button
          onClick={() => !hasSubtasks && onToggleDone(session.id)}
          className={`shrink-0 ${hasSubtasks ? "cursor-default" : ""}`}
          title={hasSubtasks ? "Derived from subtasks" : "Mark done"}
        >
          {done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} className="text-[#4d3d75]" />}
        </button>
        <button onClick={() => setOpen(!open)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
          <span className={`text-xs shrink-0 w-12 ${isOverdue ? "text-rose-400 font-medium" : "text-[#9B8FC0]"}`} style={mono}>
            {fmtDate(session.date)}
          </span>
          <span className={`text-sm truncate ${done ? "line-through text-[#6E6191]" : "text-[#E4DEF5]"}`}>{session.topic}</span>
        </button>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${typeColors[session.type] || "bg-[#3A2E58] text-[#9B8FC0]"}`}>
          {session.type}
        </span>
        <button onClick={() => setOpen(!open)} className="shrink-0 text-[#6E6191] hover:text-white">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3 pl-9 flex flex-col gap-2">
          {session.task && <p className="text-xs text-[#9B8FC0] leading-relaxed">{session.task}</p>}
          <div className="flex flex-col gap-1">
            {subtasks.map((st) => (
              <div key={st.id} className="flex items-center gap-2 group">
                <button onClick={() => onToggleSubtask(session.id, st.id)} className="shrink-0">
                  {st.done ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Circle size={13} className="text-[#4d3d75]" />}
                </button>
                <span className={`text-xs flex-1 ${st.done ? "line-through text-[#6E6191]" : "text-[#C9C1E0]"}`}>{st.text}</span>
                <button onClick={() => onRemoveSubtask(session.id, st.id)} className="opacity-0 group-hover:opacity-100 text-[#6E6191] hover:text-rose-400 transition-opacity">
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              value={subtaskText}
              onChange={(e) => setSubtaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubtask()}
              placeholder="Add a subtask…"
              className="flex-1 bg-[#170F29] border border-[#3A2E58] rounded-md text-xs text-white px-2 py-1 placeholder-[#6E6191] outline-none focus:border-pink-500/50 min-w-0"
            />
            <button
              onClick={addSubtask}
              className="shrink-0 rounded-md px-1.5 text-white"
              style={{ background: "linear-gradient(135deg, #EC4899, #C026D3)" }}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyPlanCard() {
  const [progress, setProgress] = useState(() => load("pers-study-plan-v2", {}));
  const [expandedPhase, setExpandedPhase] = useState(null);

  const groups = useMemo(() => {
    const byPhase = {};
    for (const s of STUDY_SESSIONS) {
      if (!byPhase[s.phase]) byPhase[s.phase] = { theme: s.theme, sessions: [] };
      byPhase[s.phase].sessions.push(s);
    }
    return byPhase;
  }, []);

  const getState = (id) => progress[id] || { done: false, subtasks: [] };

  const setState = (id, updater) => {
    setProgress((prev) => {
      const next = { ...prev, [id]: updater(prev[id] || { done: false, subtasks: [] }) };
      save("pers-study-plan-v2", next);
      return next;
    });
  };

  const toggleDone = (id) => setState(id, (s) => ({ ...s, done: !s.done }));
  const addSubtask = (id, text) =>
    setState(id, (s) => ({ ...s, subtasks: [...(s.subtasks || []), { id: uid(), text, done: false }] }));
  const toggleSubtask = (id, subId) =>
    setState(id, (s) => ({ ...s, subtasks: (s.subtasks || []).map((t) => (t.id === subId ? { ...t, done: !t.done } : t)) }));
  const removeSubtask = (id, subId) =>
    setState(id, (s) => ({ ...s, subtasks: (s.subtasks || []).filter((t) => t.id !== subId) }));

  const isSessionDone = (s) => {
    const st = getState(s.id);
    return st.subtasks && st.subtasks.length > 0 ? st.subtasks.every((t) => t.done) : !!st.done;
  };

  const totalDone = STUDY_SESSIONS.filter(isSessionDone).length;
  const totalPct = Math.round((totalDone / STUDY_SESSIONS.length) * 100);

  const today = todayStr();
  const defaultPhase = useMemo(() => {
    const withToday = STUDY_SESSIONS.find((s) => s.date === today);
    if (withToday) return withToday.phase;
    const firstIncomplete = STUDY_SESSIONS.find((s) => !isSessionDone(s));
    return firstIncomplete ? firstIncomplete.phase : STUDY_SESSIONS[0].phase;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const activePhase = expandedPhase || defaultPhase;

  return (
    <div className="bg-[#241B3A] border border-[#3A2E58] rounded-2xl p-5 flex flex-col gap-4 min-w-0 hover:border-[#4d3d75] transition-colors duration-200 md:col-span-2 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #EC4899, #A855F7)" }}
          >
            <BookOpen size={17} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-[15px] tracking-tight" style={display}>Study Plan</h3>
            <p className="text-[#9B8FC0] text-xs mt-0.5">
              <span style={mono}>{totalDone}/{STUDY_SESSIONS.length}</span> sessions · started Jul 20, 2026
            </p>
          </div>
        </div>
        <span className="text-xs text-[#9B8FC0] shrink-0" style={mono}>{totalPct}%</span>
      </div>
      <div className="w-full h-2 bg-[#170F29] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${totalPct}%`, background: "linear-gradient(90deg, #EC4899, #A855F7)" }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {Object.entries(groups).map(([phase, g]) => {
          const phaseDone = g.sessions.filter(isSessionDone).length;
          const isOpen = activePhase === phase;
          return (
            <div key={phase} className="border border-[#3A2E58] rounded-lg">
              <button
                onClick={() => setExpandedPhase(isOpen ? "" : phase)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isOpen ? <ChevronDown size={14} className="text-[#9B8FC0] shrink-0" /> : <ChevronRight size={14} className="text-[#9B8FC0] shrink-0" />}
                  <span className="text-sm font-medium text-[#E4DEF5] truncate">{phase}: {g.theme}</span>
                </div>
                <span className="text-xs text-[#9B8FC0] shrink-0" style={mono}>{phaseDone}/{g.sessions.length}</span>
              </button>
              {isOpen && (
                <div className="px-2 pb-2 flex flex-col gap-1.5 max-h-96 overflow-y-auto">
                  {g.sessions.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      state={getState(s.id)}
                      onToggleDone={toggleDone}
                      onAddSubtask={addSubtask}
                      onToggleSubtask={toggleSubtask}
                      onRemoveSubtask={removeSubtask}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
