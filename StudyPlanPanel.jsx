import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, CheckCircle2, Circle, Flame, HelpCircle, X } from "lucide-react";
import { STUDY_SESSIONS } from "./studyPlanData.js";
import { load, save, uid, todayStr } from "./storage.js";
import { mono, display, gradientBarStyle, gradientIconStyle, pillGradientStyle } from "./theme.js";

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
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function computeStreak(log) {
  const set = new Set(log);
  let streak = 0;
  let cursor = new Date();
  // if today isn't logged yet, start checking from yesterday so an unbroken streak isn't zeroed before the day ends
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function SessionRow({ session, state, onToggleDone, onAddSubtask, onToggleSubtask, onRemoveSubtask, onAddDoubt, onToggleDoubt, onRemoveDoubt }) {
  const [open, setOpen] = useState(false);
  const [subText, setSubText] = useState("");
  const [doubtText, setDoubtText] = useState("");
  const subtasks = state.subtasks || [];
  const doubts = state.doubts || [];
  const hasSubtasks = subtasks.length > 0;
  const done = hasSubtasks ? subtasks.every((s) => s.done) : !!state.done;
  const openSubtasks = subtasks.filter((s) => !s.done).length;
  const openDoubts = doubts.filter((d) => !d.resolved).length;
  const isToday = session.date === todayStr();
  const isOverdue = !done && session.date < todayStr();

  const addSub = () => { if (!subText.trim()) return; onAddSubtask(session.id, subText.trim()); setSubText(""); };
  const addDoubt = () => { if (!doubtText.trim()) return; onAddDoubt(session.id, doubtText.trim()); setDoubtText(""); };

  return (
    <div className={`rounded-lg border ${isToday ? "border-pink-500/50 bg-pink-500/5" : "border-[#3A2E58]"} ${done ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button onClick={() => !hasSubtasks && onToggleDone(session.id)} className={`shrink-0 ${hasSubtasks ? "cursor-default" : ""}`}>
          {done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} className="text-[#4d3d75]" />}
        </button>
        <button onClick={() => setOpen(!open)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
          <span className={`text-xs shrink-0 w-12 ${isOverdue ? "text-rose-400 font-medium" : "text-[#9B8FC0]"}`} style={mono}>{fmtDate(session.date)}</span>
          <span className={`text-sm truncate ${done ? "line-through text-[#6E6191]" : "text-[#E4DEF5]"}`}>{session.topic}</span>
        </button>
        {openDoubts > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 shrink-0">
            <HelpCircle size={10} /> {openDoubts}
          </span>
        )}
        {hasSubtasks && openSubtasks > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3A2E58] text-[#9B8FC0] shrink-0">{openSubtasks} open</span>
        )}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${typeColors[session.type] || "bg-[#3A2E58] text-[#9B8FC0]"}`}>{session.type}</span>
        <button onClick={() => setOpen(!open)} className="shrink-0 text-[#6E6191] hover:text-white">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3 pl-9 flex flex-col gap-3">
          {session.task && <p className="text-xs text-[#9B8FC0] leading-relaxed">{session.task}</p>}

          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#6E6191] mb-1.5">Subtopics</p>
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
            <div className="flex gap-1.5 mt-1.5">
              <input value={subText} onChange={(e) => setSubText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSub()} placeholder="Add a subtopic…"
                className="flex-1 bg-[#170F29] border border-[#3A2E58] rounded-md text-xs text-white px-2 py-1 placeholder-[#6E6191] outline-none focus:border-pink-500/50 min-w-0" />
              <button onClick={addSub} className="shrink-0 rounded-md px-1.5 text-white" style={pillGradientStyle}><Plus size={12} /></button>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#6E6191] mb-1.5">Doubts</p>
            <div className="flex flex-col gap-1">
              {doubts.map((d) => (
                <div key={d.id} className="flex items-center gap-2 group">
                  <button onClick={() => onToggleDoubt(session.id, d.id)} className="shrink-0">
                    {d.resolved ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Circle size={13} className="text-rose-400" />}
                  </button>
                  <span className={`text-xs flex-1 ${d.resolved ? "line-through text-[#6E6191]" : "text-[#E4DEF5]"}`}>{d.text}</span>
                  <button onClick={() => onRemoveDoubt(session.id, d.id)} className="opacity-0 group-hover:opacity-100 text-[#6E6191] hover:text-rose-400 transition-opacity">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {doubts.length === 0 && <p className="text-[11px] text-[#6E6191]">No doubts logged.</p>}
            </div>
            <div className="flex gap-1.5 mt-1.5">
              <input value={doubtText} onChange={(e) => setDoubtText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDoubt()} placeholder="Log a doubt…"
                className="flex-1 bg-[#170F29] border border-[#3A2E58] rounded-md text-xs text-white px-2 py-1 placeholder-[#6E6191] outline-none focus:border-rose-500/50 min-w-0" />
              <button onClick={addDoubt} className="shrink-0 rounded-md px-1.5 bg-rose-500 text-white"><Plus size={12} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyPlanPanel() {
  const [progress, setProgress] = useState(() => load("pers-study-plan-v3", {}));
  const [studyLog, setStudyLog] = useState(() => load("pers-study-log", []));
  const [expandedPhase, setExpandedPhase] = useState(null);

  const groups = useMemo(() => {
    const byPhase = {};
    for (const s of STUDY_SESSIONS) {
      if (!byPhase[s.phase]) byPhase[s.phase] = { theme: s.theme, sessions: [] };
      byPhase[s.phase].sessions.push(s);
    }
    return byPhase;
  }, []);

  const getState = (id) => progress[id] || { done: false, subtasks: [], doubts: [] };

  const logToday = () => {
    const t = todayStr();
    setStudyLog((prev) => {
      if (prev.includes(t)) return prev;
      const next = [...prev, t];
      save("pers-study-log", next);
      return next;
    });
  };

  const setState = (id, updater) => {
    setProgress((prev) => {
      const next = { ...prev, [id]: updater(prev[id] || { done: false, subtasks: [], doubts: [] }) };
      save("pers-study-plan-v3", next);
      return next;
    });
    logToday();
  };

  const toggleDone = (id) => setState(id, (s) => ({ ...s, done: !s.done }));
  const addSubtask = (id, text) => setState(id, (s) => ({ ...s, subtasks: [...(s.subtasks || []), { id: uid(), text, done: false }] }));
  const toggleSubtask = (id, subId) => setState(id, (s) => ({ ...s, subtasks: (s.subtasks || []).map((t) => (t.id === subId ? { ...t, done: !t.done } : t)) }));
  const removeSubtask = (id, subId) => setState(id, (s) => ({ ...s, subtasks: (s.subtasks || []).filter((t) => t.id !== subId) }));
  const addDoubt = (id, text) => setState(id, (s) => ({ ...s, doubts: [...(s.doubts || []), { id: uid(), text, resolved: false }] }));
  const toggleDoubt = (id, doubtId) => setState(id, (s) => ({ ...s, doubts: (s.doubts || []).map((d) => (d.id === doubtId ? { ...d, resolved: !d.resolved } : d)) }));
  const removeDoubt = (id, doubtId) => setState(id, (s) => ({ ...s, doubts: (s.doubts || []).filter((d) => d.id !== doubtId) }));

  const isSessionDone = (s) => {
    const st = getState(s.id);
    return st.subtasks && st.subtasks.length > 0 ? st.subtasks.every((t) => t.done) : !!st.done;
  };

  const totalDone = STUDY_SESSIONS.filter(isSessionDone).length;
  const totalPct = Math.round((totalDone / STUDY_SESSIONS.length) * 100);
  const streak = useMemo(() => computeStreak(studyLog), [studyLog]);

  const today = todayStr();
  const defaultPhase = useMemo(() => {
    const withToday = STUDY_SESSIONS.find((s) => s.date === today);
    if (withToday) return withToday.phase;
    const firstIncomplete = STUDY_SESSIONS.find((s) => !isSessionDone(s));
    return firstIncomplete ? firstIncomplete.phase : STUDY_SESSIONS[0].phase;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const activePhase = expandedPhase || defaultPhase;
  const totalOpenDoubts = Object.values(progress).reduce((sum, s) => sum + (s.doubts ? s.doubts.filter((d) => !d.resolved).length : 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-white" style={display}>Study Plan</h2>
          <p className="text-[#9B8FC0] text-xs mt-0.5">
            <span style={mono}>{totalDone}/{STUDY_SESSIONS.length}</span> sessions · started Jul 20, 2026
            {totalOpenDoubts > 0 && <> · <span className="text-rose-300">{totalOpenDoubts} open doubt{totalOpenDoubts > 1 ? "s" : ""}</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#241B3A] border border-[#3A2E58] rounded-full px-3.5 py-1.5">
          <Flame size={15} className={streak > 0 ? "text-amber-400" : "text-[#4d3d75]"} />
          <span className="text-sm text-white font-semibold" style={mono}>{streak}</span>
          <span className="text-xs text-[#9B8FC0]">day streak</span>
        </div>
      </div>

      <div className="w-full h-2 bg-[#170F29] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalPct}%`, ...gradientBarStyle }} />
      </div>

      <div className="flex flex-col gap-2">
        {Object.entries(groups).map(([phase, g]) => {
          const phaseDone = g.sessions.filter(isSessionDone).length;
          const isOpen = activePhase === phase;
          return (
            <div key={phase} className="border border-[#3A2E58] rounded-lg">
              <button onClick={() => setExpandedPhase(isOpen ? "" : phase)} className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left">
                <div className="flex items-center gap-2 min-w-0">
                  {isOpen ? <ChevronDown size={14} className="text-[#9B8FC0] shrink-0" /> : <ChevronRight size={14} className="text-[#9B8FC0] shrink-0" />}
                  <span className="text-sm font-medium text-[#E4DEF5] truncate">{phase}: {g.theme}</span>
                </div>
                <span className="text-xs text-[#9B8FC0] shrink-0" style={mono}>{phaseDone}/{g.sessions.length}</span>
              </button>
              {isOpen && (
                <div className="px-2 pb-2 flex flex-col gap-1.5 max-h-[32rem] overflow-y-auto">
                  {g.sessions.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      state={getState(s.id)}
                      onToggleDone={toggleDone}
                      onAddSubtask={addSubtask}
                      onToggleSubtask={toggleSubtask}
                      onRemoveSubtask={removeSubtask}
                      onAddDoubt={addDoubt}
                      onToggleDoubt={toggleDoubt}
                      onRemoveDoubt={removeDoubt}
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
