import React, { useState } from "react";
import { Plus, Trash2, Users, BookMarked } from "lucide-react";
import { load, save, uid } from "./storage.js";
import { display, mono, inputClass, pillGradientStyle } from "./theme.js";

function fmtTimestamp(ts) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function MeetingNotes() {
  const [notes, setNotes] = useState(() => load("pers-notes-meeting", []));
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const add = () => {
    if (!title.trim() && !text.trim()) return;
    const next = [{ id: uid(), title: title.trim(), text: text.trim(), createdAt: Date.now() }, ...notes];
    setNotes(next);
    save("pers-notes-meeting", next);
    setTitle(""); setText("");
  };
  const remove = (id) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    save("pers-notes-meeting", next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#1D1533] border border-[#3A2E58] rounded-xl p-3.5 flex flex-col gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title…" className={inputClass} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Notes from the meeting…" rows={3}
          className="bg-[#170F29] border border-[#3A2E58] rounded-lg text-sm text-white px-3 py-2 placeholder-[#6E6191] outline-none focus:border-pink-500/50 resize-none" />
        <button onClick={add} className="self-end text-xs text-white px-3.5 py-1.5 rounded-lg" style={pillGradientStyle}>Save note</button>
      </div>
      <div className="flex flex-col gap-2">
        {notes.length === 0 && <p className="text-[#6E6191] text-sm text-center py-6">No meeting notes yet.</p>}
        {notes.map((n) => (
          <div key={n.id} className="bg-[#241B3A] border border-[#3A2E58] rounded-xl p-3.5 group">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {n.title && <p className="text-sm font-medium text-white truncate">{n.title}</p>}
                <p className="text-[10px] text-[#6E6191] mt-0.5" style={mono}>{fmtTimestamp(n.createdAt)}</p>
              </div>
              <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100 text-[#6E6191] hover:text-rose-400 shrink-0 transition-opacity">
                <Trash2 size={13} />
              </button>
            </div>
            {n.text && <p className="text-xs text-[#C9C1E0] mt-2 whitespace-pre-wrap">{n.text}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyNotes() {
  const [notes, setNotes] = useState(() => load("pers-notes-daily", []));
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    const next = [{ id: uid(), text: text.trim(), createdAt: Date.now() }, ...notes];
    setNotes(next);
    save("pers-notes-daily", next);
    setText("");
  };
  const remove = (id) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    save("pers-notes-daily", next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Quick note…" className={`flex-1 ${inputClass}`} />
        <button onClick={add} className="shrink-0 rounded-lg px-2.5 text-white" style={pillGradientStyle}><Plus size={16} /></button>
      </div>
      <div className="flex flex-col gap-2">
        {notes.length === 0 && <p className="text-[#6E6191] text-sm text-center py-6">Nothing logged yet.</p>}
        {notes.map((n) => (
          <div key={n.id} className="flex items-start gap-2 group bg-[#170F29] border border-[#3A2E58] rounded-lg px-3 py-2.5">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#E4DEF5]">{n.text}</span>
              <p className="text-[10px] text-[#6E6191] mt-1" style={mono}>{fmtTimestamp(n.createdAt)}</p>
            </div>
            <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100 text-[#6E6191] hover:text-rose-400 shrink-0 transition-opacity">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotesPanel() {
  const [tab, setTab] = useState("meeting");

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-white" style={display}>Notes</h2>
        <p className="text-[#9B8FC0] text-xs mt-0.5">Meeting notes and daily notes</p>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => setTab("meeting")}
          className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border ${tab === "meeting" ? "text-white border-transparent" : "border-[#3A2E58] text-[#9B8FC0]"}`}
          style={tab === "meeting" ? { background: "linear-gradient(135deg, #EC4899, #C026D3)" } : {}}
        >
          <Users size={12} /> Meeting Notes
        </button>
        <button
          onClick={() => setTab("daily")}
          className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border ${tab === "daily" ? "text-white border-transparent" : "border-[#3A2E58] text-[#9B8FC0]"}`}
          style={tab === "daily" ? { background: "linear-gradient(135deg, #EC4899, #C026D3)" } : {}}
        >
          <BookMarked size={12} /> Daily Notes
        </button>
      </div>
      {tab === "meeting" ? <MeetingNotes /> : <DailyNotes />}
    </div>
  );
}
