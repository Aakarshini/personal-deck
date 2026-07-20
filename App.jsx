import React, { useState, useEffect } from "react";
import StudyPlanCard from "./StudyPlanCard.jsx";
import {
  ListChecks, Sparkles, HeartPulse, Bell, Calendar,
  Plus, Trash2, CheckCircle2, Circle, X
} from "lucide-react";

// ---------- storage helpers ----------
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

// ---------- shared UI atoms ----------
function Card({ icon: Icon, title, accent, children, subtitle }) {
  return (
    <div className="bg-[#241B3A] border border-[#3A2E58] rounded-2xl p-5 flex flex-col gap-4 min-w-0 shadow-lg shadow-black/20 hover:border-[#4d3d75] transition-colors duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${accent.iconBg}`}>
            <Icon size={17} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-[15px] tracking-tight truncate" style={display}>
              {title}
            </h3>
            {subtitle && <p className="text-[#9B8FC0] text-xs mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div className="w-full h-2 bg-[#170F29] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: "linear-gradient(90deg, #EC4899, #A855F7)" }}
      />
    </div>
  );
}

function EmptyState({ text, cta }) {
  return (
    <div className="border border-dashed border-[#4d3d75] rounded-xl py-6 px-4 text-center bg-[#1D1533]/60">
      <p className="text-[#9B8FC0] text-sm">{text}</p>
      {cta && <p className="text-[#6E6191] text-xs mt-1">{cta}</p>}
    </div>
  );
}

const inputClass =
  "bg-[#170F29] border border-[#3A2E58] rounded-lg text-sm text-white px-3 py-1.5 placeholder-[#6E6191] outline-none focus:border-[#EC4899] transition-colors min-w-0";

const pillButton =
  "shrink-0 rounded-lg px-2.5 text-white hover:brightness-110 transition";
const pillButtonStyle = { background: "linear-gradient(135deg, #EC4899, #C026D3)" };

// ---------- Tasks module ----------
function TasksCard({ storageKey, accent }) {
  const [tasks, setTasks] = useState(() => load(storageKey, []));
  const [text, setText] = useState("");
  const [bucket, setBucket] = useState("today");
  const [filter, setFilter] = useState("today");

  useEffect(() => save(storageKey, tasks), [tasks, storageKey]);

  const addTask = () => {
    if (!text.trim()) return;
    setTasks([{ id: uid(), text: text.trim(), bucket, done: false, createdAt: Date.now() }, ...tasks]);
    setText("");
  };
  const toggle = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const visible = filter === "all" ? tasks : tasks.filter((t) => t.bucket === filter);
  const total = visible.length;
  const done = visible.filter((t) => t.done).length;
  const rate = total === 0 ? 0 : Math.round((done / total) * 100);

  const buckets = [
    { id: "today", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "all", label: "All" },
  ];

  return (
    <Card icon={ListChecks} title="Tasks" accent={accent} subtitle={
      <span>
        <span style={mono}>{done}/{total}</span> complete · <span style={mono}>{rate}%</span>
      </span>
    }>
      <ProgressBar pct={rate} />
      <div className="flex gap-1.5 flex-wrap">
        {buckets.map((b) => (
          <button
            key={b.id}
            onClick={() => setFilter(b.id)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filter === b.id ? "text-white border-transparent font-medium" : "border-[#3A2E58] text-[#9B8FC0] hover:text-white"
            }`}
            style={filter === b.id ? pillButtonStyle : {}}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <select
          value={bucket}
          onChange={(e) => setBucket(e.target.value)}
          className="bg-[#170F29] border border-[#3A2E58] rounded-lg text-xs text-[#9B8FC0] px-2"
        >
          <option value="today">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task…"
          className={`flex-1 ${inputClass}`}
        />
        <button onClick={addTask} className={pillButton} style={pillButtonStyle}>
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
        {visible.length === 0 && <EmptyState text="No tasks here yet." />}
        {visible.map((t) => (
          <div key={t.id} className="flex items-center gap-2 group py-1">
            <button onClick={() => toggle(t.id)} className="shrink-0">
              {t.done ? <CheckCircle2 size={16} className="text-pink-400" /> : <Circle size={16} className="text-[#4d3d75]" />}
            </button>
            <span className={`text-sm flex-1 min-w-0 truncate ${t.done ? "text-[#6E6191] line-through" : "text-[#E4DEF5]"}`}>{t.text}</span>
            <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-[#6E6191] hover:text-rose-400 shrink-0 transition-opacity">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------- Notes-style module ----------
function NotesCard({ storageKey, accent, icon, title, subtitle, placeholder }) {
  const [notes, setNotes] = useState(() => load(storageKey, []));
  const [text, setText] = useState("");

  useEffect(() => save(storageKey, notes), [notes, storageKey]);

  const add = () => {
    if (!text.trim()) return;
    setNotes([{ id: uid(), text: text.trim(), createdAt: Date.now() }, ...notes]);
    setText("");
  };
  const remove = (id) => setNotes(notes.filter((n) => n.id !== id));

  return (
    <Card icon={icon} title={title} accent={accent} subtitle={subtitle}>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className={`flex-1 ${inputClass}`}
        />
        <button onClick={add} className={pillButton} style={pillButtonStyle}>
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
        {notes.length === 0 && <EmptyState text="Nothing logged yet." />}
        {notes.map((n) => (
          <div key={n.id} className="flex items-start gap-2 group bg-[#170F29] border border-[#3A2E58] rounded-lg px-3 py-2.5">
            <span className="text-sm text-[#E4DEF5] flex-1 min-w-0">{n.text}</span>
            <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100 text-[#6E6191] hover:text-rose-400 shrink-0 transition-opacity">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------- Progress list module ----------
function ProgressListCard({ storageKey, accent, icon, title, subtitle, itemLabel }) {
  const [items, setItems] = useState(() => load(storageKey, []));
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  useEffect(() => save(storageKey, items), [items, storageKey]);

  const add = () => {
    if (!name.trim() || !target || isNaN(parseInt(target))) return;
    setItems([...items, { id: uid(), name: name.trim(), target: parseInt(target), current: 0 }]);
    setName("");
    setTarget("");
  };
  const bump = (id, delta) =>
    setItems(items.map((it) => (it.id === id ? { ...it, current: Math.max(0, Math.min(it.target, it.current + delta)) } : it)));
  const remove = (id) => setItems(items.filter((it) => it.id !== id));

  return (
    <Card icon={icon} title={title} accent={accent} subtitle={subtitle}>
      <div className="flex flex-col gap-3.5 max-h-52 overflow-y-auto pr-1">
        {items.length === 0 && <EmptyState text={`No ${itemLabel} added yet.`} />}
        {items.map((it) => {
          const pct = it.target === 0 ? 0 : Math.round((it.current / it.target) * 100);
          return (
            <div key={it.id} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-[#E4DEF5] truncate">{it.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#9B8FC0]" style={mono}>{it.current}/{it.target}</span>
                  <button onClick={() => bump(it.id, -1)} className="text-[#6E6191] hover:text-white text-xs w-4">−</button>
                  <button onClick={() => bump(it.id, 1)} className="text-[#6E6191] hover:text-white text-xs w-4">+</button>
                  <button onClick={() => remove(it.id)} className="opacity-0 group-hover:opacity-100 text-[#6E6191] hover:text-rose-400 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <ProgressBar pct={pct} />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`New ${itemLabel} name…`}
          className={`flex-1 ${inputClass}`}
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target"
          className={`w-16 ${inputClass}`}
        />
        <button onClick={add} className={pillButton} style={pillButtonStyle}>
          <Plus size={16} />
        </button>
      </div>
    </Card>
  );
}

const accent = { iconBg: "bg-gradient-to-br from-pink-500 to-fuchsia-600" };

export default function App() {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen w-full text-white" style={{ fontFamily: "'Inter', sans-serif", background: "#170F29" }}>
      {/* top bar, echoing Artium's header */}
      <div
        className="w-full px-5 md:px-10 py-4 flex items-center justify-between border-b border-[#3A2E58]"
        style={{ background: "linear-gradient(90deg, #1D1533, #241B3A)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #EC4899, #A855F7)" }}
          >
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

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 flex flex-col gap-8">
        <div>
          <span className="text-[#9B8FC0] text-xs uppercase tracking-widest">{today}</span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1" style={display}>
            Hi Aakarshini <span>👋</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TasksCard storageKey="pers-tasks" accent={accent} />
          <StudyPlanCard accent={accent} />
          <ProgressListCard storageKey="pers-health" accent={accent} icon={HeartPulse} title="Health Plan" subtitle="Habits and weekly targets" itemLabel="habit" />
          <NotesCard storageKey="pers-notes" accent={accent} icon={Sparkles} title="Notes" subtitle="Anything worth remembering" placeholder="Add a note…" />
        </div>

        <p className="text-[#6E6191] text-xs text-center pt-4">Saved to this browser automatically.</p>
      </div>
    </div>
  );
}
