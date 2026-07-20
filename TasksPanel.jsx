import React, { useState, useMemo } from "react";
import {
  Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronRight,
  ChevronLeft, ListChecks, CalendarDays, User, Link2, X
} from "lucide-react";
import { load, save, uid, todayStr } from "./storage.js";
import { mono, display, inputClass, pillGradientStyle } from "./theme.js";

const isTaskDone = (t) => (t.subtasks && t.subtasks.length > 0 ? t.subtasks.every((s) => s.done) : !!t.done);

function AddTaskForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [bucket, setBucket] = useState("today");
  const [dueDate, setDueDate] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [helpFrom, setHelpFrom] = useState("");
  const [docLink, setDocLink] = useState("");

  const reset = () => {
    setText(""); setBucket("today"); setDueDate(""); setReportTo(""); setHelpFrom(""); setDocLink(""); setOpen(false);
  };

  const submit = () => {
    if (!text.trim()) return;
    onAdd({
      id: uid(),
      text: text.trim(),
      bucket,
      dueDate: dueDate || null,
      reportTo: reportTo.trim(),
      helpFrom: helpFrom.trim(),
      docLink: docLink.trim(),
      done: false,
      subtasks: [],
      createdAt: Date.now(),
    });
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-white px-3.5 py-2 rounded-lg shrink-0"
        style={pillGradientStyle}
      >
        <Plus size={15} /> New task
      </button>
    );
  }

  return (
    <div className="bg-[#1D1533] border border-[#3A2E58] rounded-xl p-4 flex flex-col gap-2.5">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Task title…" className={inputClass} />
      <div className="grid grid-cols-2 gap-2">
        <select value={bucket} onChange={(e) => setBucket(e.target.value)} className="bg-[#170F29] border border-[#3A2E58] rounded-lg text-xs text-[#9B8FC0] px-2 py-1.5">
          <option value="today">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-[#170F29] border border-[#3A2E58] rounded-lg text-xs text-white px-2 py-1.5" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={reportTo} onChange={(e) => setReportTo(e.target.value)} placeholder="Report to…" className={inputClass} />
        <input value={helpFrom} onChange={(e) => setHelpFrom(e.target.value)} placeholder="Help needed from…" className={inputClass} />
      </div>
      <input value={docLink} onChange={(e) => setDocLink(e.target.value)} placeholder="Document link (optional)…" className={inputClass} />
      <div className="flex gap-2 justify-end pt-1">
        <button onClick={reset} className="text-xs text-[#9B8FC0] px-3 py-1.5">Cancel</button>
        <button onClick={submit} className="text-xs text-white px-3.5 py-1.5 rounded-lg" style={pillGradientStyle}>Add task</button>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggleDone, onRemove, onAddSubtask, onToggleSubtask, onRemoveSubtask }) {
  const [open, setOpen] = useState(false);
  const [subText, setSubText] = useState("");
  const done = isTaskDone(task);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const isOverdue = !done && task.dueDate && task.dueDate < todayStr();

  const addSub = () => {
    if (!subText.trim()) return;
    onAddSubtask(task.id, subText.trim());
    setSubText("");
  };

  return (
    <div className={`rounded-lg border border-[#3A2E58] ${done ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button onClick={() => !hasSubtasks && onToggleDone(task.id)} className={`shrink-0 ${hasSubtasks ? "cursor-default" : ""}`}>
          {done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} className="text-[#4d3d75]" />}
        </button>
        <button onClick={() => setOpen(!open)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
          {task.dueDate && (
            <span className={`text-xs shrink-0 ${isOverdue ? "text-rose-400 font-medium" : "text-[#9B8FC0]"}`} style={mono}>
              {new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
          <span className={`text-sm truncate ${done ? "line-through text-[#6E6191]" : "text-[#E4DEF5]"}`}>{task.text}</span>
        </button>
        <button onClick={() => onRemove(task.id)} className="text-[#6E6191] hover:text-rose-400 shrink-0">
          <Trash2 size={13} />
        </button>
        <button onClick={() => setOpen(!open)} className="shrink-0 text-[#6E6191] hover:text-white">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3 pl-9 flex flex-col gap-2.5">
          {(task.reportTo || task.helpFrom) && (
            <div className="flex flex-col gap-1 text-xs text-[#9B8FC0]">
              {task.reportTo && <div className="flex items-center gap-1.5"><User size={11} /> Report to: <span className="text-[#C9C1E0]">{task.reportTo}</span></div>}
              {task.helpFrom && <div className="flex items-center gap-1.5"><User size={11} /> Help from: <span className="text-[#C9C1E0]">{task.helpFrom}</span></div>}
            </div>
          )}
          {task.docLink && (
            <a href={task.docLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-pink-300 hover:text-pink-200 w-fit">
              <Link2 size={11} /> Open document
            </a>
          )}
          <div className="flex flex-col gap-1">
            {(task.subtasks || []).map((st) => (
              <div key={st.id} className="flex items-center gap-2 group">
                <button onClick={() => onToggleSubtask(task.id, st.id)} className="shrink-0">
                  {st.done ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Circle size={13} className="text-[#4d3d75]" />}
                </button>
                <span className={`text-xs flex-1 ${st.done ? "line-through text-[#6E6191]" : "text-[#C9C1E0]"}`}>{st.text}</span>
                <button onClick={() => onRemoveSubtask(task.id, st.id)} className="opacity-0 group-hover:opacity-100 text-[#6E6191] hover:text-rose-400 transition-opacity">
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSub()}
              placeholder="Add a subtask…"
              className="flex-1 bg-[#170F29] border border-[#3A2E58] rounded-md text-xs text-white px-2 py-1 placeholder-[#6E6191] outline-none focus:border-pink-500/50 min-w-0"
            />
            <button onClick={addSub} className="shrink-0 rounded-md px-1.5 text-white" style={pillGradientStyle}>
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ tasks, selectedDate, onSelectDate }) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tasksByDate = useMemo(() => {
    const map = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    }
    return map;
  }, [tasks]);

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = monthCursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button onClick={() => setMonthCursor(new Date(year, month - 1, 1))} className="text-[#9B8FC0] hover:text-white">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-white" style={display}>{monthLabel}</span>
        <button onClick={() => setMonthCursor(new Date(year, month + 1, 1))} className="text-[#9B8FC0] hover:text-white">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[#6E6191]">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = dateStr === todayStr();
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={i}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 border transition-colors ${
                isSelected ? "border-pink-400" : isToday ? "border-pink-500/40" : "border-transparent"
              } hover:bg-[#1D1533]`}
            >
              <span className={isToday ? "text-pink-300 font-semibold" : "text-[#C9C1E0]"}>{d}</span>
              {dayTasks.length > 0 && <span className="w-1 h-1 rounded-full bg-pink-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TasksPanel() {
  const [tasks, setTasks] = useState(() => load("pers-tasks-v2", []));
  const [filter, setFilter] = useState("today");
  const [view, setView] = useState("list");
  const [selectedDate, setSelectedDate] = useState(null);

  const persist = (next) => {
    setTasks(next);
    save("pers-tasks-v2", next);
  };

  const addTask = (task) => persist([task, ...tasks]);
  const removeTask = (id) => persist(tasks.filter((t) => t.id !== id));
  const toggleDone = (id) => persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const addSubtask = (id, text) =>
    persist(tasks.map((t) => (t.id === id ? { ...t, subtasks: [...(t.subtasks || []), { id: uid(), text, done: false }] } : t)));
  const toggleSubtask = (id, subId) =>
    persist(tasks.map((t) => (t.id === id ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) } : t)));
  const removeSubtask = (id, subId) =>
    persist(tasks.map((t) => (t.id === id ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subId) } : t)));

  const buckets = [
    { id: "today", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "all", label: "All" },
  ];

  let visible = filter === "all" ? tasks : tasks.filter((t) => t.bucket === filter);
  if (view === "calendar" && selectedDate) visible = tasks.filter((t) => t.dueDate === selectedDate);

  const pending = useMemo(
    () =>
      tasks
        .filter((t) => !isTaskDone(t))
        .sort((a, b) => (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : 1),
    [tasks]
  );

  const total = visible.length;
  const done = visible.filter(isTaskDone).length;
  const rate = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* main */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-white" style={display}>Tasks</h2>
            <p className="text-[#9B8FC0] text-xs mt-0.5"><span style={mono}>{done}/{total}</span> complete · <span style={mono}>{rate}%</span></p>
          </div>
          <AddTaskForm onAdd={addTask} />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {buckets.map((b) => (
              <button
                key={b.id}
                onClick={() => { setFilter(b.id); setSelectedDate(null); }}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  filter === b.id && view === "list" ? "text-white border-transparent font-medium" : "border-[#3A2E58] text-[#9B8FC0] hover:text-white"
                }`}
                style={filter === b.id && view === "list" ? { background: "linear-gradient(135deg, #EC4899, #C026D3)" } : {}}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setView("list")} className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${view === "list" ? "border-pink-400 text-white" : "border-[#3A2E58] text-[#9B8FC0]"}`}>
              <ListChecks size={12} /> List
            </button>
            <button onClick={() => setView("calendar")} className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${view === "calendar" ? "border-pink-400 text-white" : "border-[#3A2E58] text-[#9B8FC0]"}`}>
              <CalendarDays size={12} /> Calendar
            </button>
          </div>
        </div>

        {view === "calendar" && (
          <div className="bg-[#1D1533] border border-[#3A2E58] rounded-xl p-4">
            <CalendarView tasks={tasks} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {visible.length === 0 && (
            <div className="border border-dashed border-[#4d3d75] rounded-xl py-8 px-4 text-center bg-[#1D1533]/60">
              <p className="text-[#9B8FC0] text-sm">{selectedDate ? "No tasks due this day." : "No tasks here yet."}</p>
            </div>
          )}
          {visible.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggleDone={toggleDone}
              onRemove={removeTask}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onRemoveSubtask={removeSubtask}
            />
          ))}
        </div>
      </div>

      {/* pending sidebar */}
      <div className="lg:w-72 shrink-0">
        <div className="bg-[#241B3A] border border-[#3A2E58] rounded-2xl p-4 sticky top-4">
          <h3 className="text-white text-sm font-semibold mb-3" style={display}>Pending ({pending.length})</h3>
          <div className="flex flex-col gap-2 max-h-[32rem] overflow-y-auto pr-1">
            {pending.length === 0 && <p className="text-[#6E6191] text-xs">Nothing pending — nice.</p>}
            {pending.map((t) => (
              <div key={t.id} className="bg-[#170F29] border border-[#3A2E58] rounded-lg px-2.5 py-2">
                <p className="text-xs text-[#E4DEF5] truncate">{t.text}</p>
                {t.dueDate && (
                  <p className={`text-[10px] mt-0.5 ${t.dueDate < todayStr() ? "text-rose-400" : "text-[#9B8FC0]"}`} style={mono}>
                    {new Date(t.dueDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
