import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { deadlineService } from '../services/api';

const TYPE_META = {
  scholarship:  { label: 'Scholarship',        color: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
  application:  { label: 'Program Application', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  other:        { label: 'Other',               color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
};

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function formatDate(dateStr) {
  // dateStr is "YYYY-MM-DD"
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
}

function urgencyStyle(days) {
  if (days < 0)  return { color: 'var(--ink-4)', strikethrough: true };
  if (days <= 7)  return { color: '#dc2626' };
  if (days <= 30) return { color: '#f59e0b' };
  return { color: '#10b981' };
}

// ─── Add / Edit Modal ────────────────────────────────────────────────────────
function DeadlineModal({ entry, onSave, onClose }) {
  const [title,     setTitle]     = useState(entry?.title      || '');
  const [deadline,  setDeadline]  = useState(entry?.deadline   || '');
  const [entryType, setEntryType] = useState(entry?.entry_type || 'other');
  const [notes,     setNotes]     = useState(entry?.notes      || '');
  const [saving,    setSaving]    = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !deadline) return;
    setSaving(true);
    try {
      await onSave({ title: title.trim(), deadline, entry_type: entryType, notes });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50,
      display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width:420, padding:24 }}>
        <div className="row between" style={{ marginBottom:16 }}>
          <span style={{ fontWeight:600, fontSize:15 }}>{entry ? 'Edit Deadline' : 'Add Deadline'}</span>
          <button className="btn btn-icon" onClick={onClose}><Icon.X size={14}/></button>
        </div>

        <div className="col" style={{ gap:10 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--ink-3)', fontWeight:500 }}>Title *</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. NSF GRFP Application" style={{ width:'100%', marginTop:4 }}/>
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--ink-3)', fontWeight:500 }}>Deadline date *</label>
            <input type="date" className="input" value={deadline} onChange={e => setDeadline(e.target.value)}
              style={{ width:'100%', marginTop:4 }}/>
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--ink-3)', fontWeight:500 }}>Type</label>
            <select className="input" value={entryType} onChange={e => setEntryType(e.target.value)}
              style={{ width:'100%', marginTop:4 }}>
              <option value="scholarship">Scholarship</option>
              <option value="application">Program Application</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--ink-3)', fontWeight:500 }}>Notes</label>
            <textarea className="input" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any details…" rows={2} style={{ width:'100%', marginTop:4, resize:'vertical' }}/>
          </div>
        </div>

        <div className="row gap-2" style={{ marginTop:18, justifyContent:'flex-end' }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim() || !deadline || saving}>
            {saving ? 'Saving…' : (entry ? 'Save changes' : 'Add Deadline')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Month Grid ──────────────────────────────────────────────────────────
function MonthGrid({ year, month, deadlines, onDayClick, selectedDay }) {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  const todayD = today.getDate();
  const todayM = today.getMonth();
  const todayY = today.getFullYear();

  // Map day → list of deadlines
  const dayMap = {};
  deadlines.forEach(d => {
    const [dy, dm, dd] = d.deadline.split('-').map(Number);
    if (dy === year && dm - 1 === month) {
      if (!dayMap[dd]) dayMap[dd] = [];
      dayMap[dd].push(d);
    }
  });

  const cells = [];
  // Blank cells before first day
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) => d === todayD && month === todayM && year === todayY;

  return (
    <div>
      {/* Day-of-week header */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
        {DAY_NAMES.map(n => (
          <div key={n} style={{ textAlign:'center', fontSize:10, color:'var(--ink-4)', fontWeight:600, padding:'2px 0' }}>{n}</div>
        ))}
      </div>
      {/* Day cells */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i}/>;
          const dots = dayMap[d] || [];
          const active = selectedDay === d;
          const todayCls = isToday(d);
          return (
            <div key={i} onClick={() => onDayClick(d)}
              style={{
                textAlign:'center', padding:'4px 2px', borderRadius:6, cursor: dots.length ? 'pointer' : 'default',
                background: active ? 'var(--ink)' : todayCls ? 'var(--green-deep)' : 'transparent',
                color: (active || todayCls) ? 'white' : dots.length ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: todayCls ? 600 : 400,
                fontSize: 13,
                position: 'relative',
              }}>
              {d}
              {dots.length > 0 && (
                <div style={{ display:'flex', justifyContent:'center', gap:2, marginTop:2 }}>
                  {dots.slice(0,3).map((dot, di) => (
                    <span key={di} style={{
                      width:5, height:5, borderRadius:'50%',
                      background: active ? 'white' : TYPE_META[dot.entry_type]?.color || '#6b7280',
                    }}/>
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

// ─── Deadline Row ─────────────────────────────────────────────────────────────
function DeadlineRow({ deadline, onEdit, onDelete }) {
  const days = daysUntil(deadline.deadline);
  const { color, strikethrough } = urgencyStyle(days);
  const meta = TYPE_META[deadline.entry_type] || TYPE_META.other;

  return (
    <div className="card" style={{ padding:'10px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
      {/* Date block */}
      <div style={{ width:52, textAlign:'center', flexShrink:0 }}>
        <div style={{ fontSize:20, fontWeight:700, lineHeight:1, color }}>
          {deadline.deadline.split('-')[2]}
        </div>
        <div style={{ fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
          {MONTH_NAMES[parseInt(deadline.deadline.split('-')[1]) - 1].slice(0,3)}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:13, textDecoration: strikethrough ? 'line-through' : 'none', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {deadline.title}
        </div>
        <div className="row gap-2" style={{ marginTop:3 }}>
          <span style={{ fontSize:11, padding:'2px 6px', borderRadius:4, background: meta.bg, color: meta.color, fontWeight:500 }}>
            {meta.label}
          </span>
          <span style={{ fontSize:11, color }}>
            {days < 0 ? 'Passed' : days === 0 ? 'Today!' : `${days}d left`}
          </span>
        </div>
        {deadline.notes && (
          <div style={{ fontSize:12, color:'var(--ink-4)', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {deadline.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="row gap-1">
        <button className="btn btn-icon" style={{ padding:4 }} onClick={() => onEdit(deadline)} title="Edit"><Icon.FileText size={12}/></button>
        <button className="btn btn-icon" style={{ padding:4, color:'var(--ink-4)' }} onClick={() => onDelete(deadline.id)} title="Delete"><Icon.Trash size={12}/></button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DeadlineCalendar() {
  const [deadlines,  setDeadlines]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [addModal,   setAddModal]   = useState(false);
  const [editEntry,  setEditEntry]  = useState(null);
  const [viewDate,   setViewDate]   = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [filter,     setFilter]     = useState('upcoming'); // upcoming | all | passed

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setLoading(false); return; }
    deadlineService.getAll()
      .then(res => setDeadlines(res.data.results || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── CRUD ──
  const handleAdd = async (data) => {
    const res = await deadlineService.create(data);
    setDeadlines(prev => [...prev, res.data].sort((a,b) => a.deadline.localeCompare(b.deadline)));
    setAddModal(false);
  };

  const handleEdit = async (data) => {
    const res = await deadlineService.update(editEntry.id, data);
    setDeadlines(prev => prev.map(d => d.id === editEntry.id ? res.data : d)
      .sort((a,b) => a.deadline.localeCompare(b.deadline)));
    setEditEntry(null);
  };

  const handleDelete = async (id) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
    deadlineService.remove(id).catch(() => {});
  };

  // ── Filter list ──
  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr = today.toISOString().slice(0,10);

  let listDeadlines = deadlines;
  if (filter === 'upcoming') listDeadlines = deadlines.filter(d => d.deadline >= todayStr);
  if (filter === 'passed')   listDeadlines = deadlines.filter(d => d.deadline < todayStr);

  // If a day is selected, show only that day's deadlines
  const selectedDayStr = selectedDay
    ? `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
    : null;
  const displayList = selectedDay
    ? deadlines.filter(d => d.deadline === selectedDayStr)
    : listDeadlines;

  // Stats
  const urgentCount = deadlines.filter(d => { const n = daysUntil(d.deadline); return n >= 0 && n <= 30; }).length;

  if (loading) return <div style={{ padding:40, color:'var(--ink-3)' }}>Loading calendar…</div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>
      {/* Header */}
      <div className="row between" style={{ padding:'20px 20px 12px', flexShrink:0 }}>
        <div className="col" style={{ gap:2 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>Deadline Calendar</h2>
          <div style={{ fontSize:13, color:'var(--ink-3)' }}>
            Track scholarship and application deadlines
          </div>
        </div>
        <div className="row gap-3">
          {urgentCount > 0 && (
            <div style={{ fontSize:12, padding:'4px 10px', borderRadius:6, background:'rgba(220,38,38,0.1)', color:'#dc2626', fontWeight:500 }}>
              {urgentCount} deadline{urgentCount > 1 ? 's' : ''} within 30 days
            </div>
          )}
          <button className="btn btn-primary" onClick={() => setAddModal(true)}>
            <Icon.Plus size={13}/> Add Deadline
          </button>
        </div>
      </div>

      {/* Body: two-column layout */}
      <div style={{ display:'flex', gap:20, padding:'0 20px 20px', flex:1, minHeight:0, overflow:'hidden' }}>

        {/* Left: calendar + mini stats */}
        <div style={{ width:280, flexShrink:0, display:'flex', flexDirection:'column', gap:16 }}>
          {/* Month navigation */}
          <div className="card" style={{ padding:16 }}>
            <div className="row between" style={{ marginBottom:12 }}>
              <button className="btn btn-icon" onClick={() => { const d = new Date(year, month-1,1); setViewDate(d); setSelectedDay(null); }}>
                <Icon.Chevron size={14} style={{ transform:'rotate(180deg)' }}/>
              </button>
              <span style={{ fontWeight:600, fontSize:14 }}>
                {MONTH_NAMES[month]} {year}
              </span>
              <button className="btn btn-icon" onClick={() => { const d = new Date(year, month+1,1); setViewDate(d); setSelectedDay(null); }}>
                <Icon.Chevron size={14}/>
              </button>
            </div>
            <MonthGrid
              year={year} month={month}
              deadlines={deadlines}
              selectedDay={selectedDay}
              onDayClick={d => setSelectedDay(prev => prev === d ? null : d)}
            />
            {selectedDay && (
              <button className="btn btn-sm" style={{ width:'100%', marginTop:10, justifyContent:'center' }}
                onClick={() => setSelectedDay(null)}>
                Clear selection
              </button>
            )}
          </div>

          {/* Type breakdown */}
          {deadlines.length > 0 && (
            <div className="card" style={{ padding:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-3)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Breakdown</div>
              {Object.entries(TYPE_META).map(([type, meta]) => {
                const count = deadlines.filter(d => d.entry_type === type).length;
                if (!count) return null;
                return (
                  <div key={type} className="row between" style={{ marginBottom:6 }}>
                    <div className="row gap-2">
                      <span style={{ width:8, height:8, borderRadius:'50%', background:meta.color, flexShrink:0, marginTop:2 }}/>
                      <span style={{ fontSize:12 }}>{meta.label}</span>
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color:meta.color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: deadline list */}
        <div style={{ flex:1, overflow:'auto', minWidth:0 }}>
          {/* Filter tabs */}
          {!selectedDay && deadlines.length > 0 && (
            <div className="row gap-2" style={{ marginBottom:12 }}>
              {[['upcoming','Upcoming'],['all','All'],['passed','Passed']].map(([id, label]) => (
                <button key={id} className="chip"
                  style={{ padding:'5px 12px', background: filter===id ? 'var(--ink)' : 'white',
                    color: filter===id ? 'var(--paper)' : 'var(--ink-2)', borderColor: filter===id ? 'var(--ink)' : 'var(--line)' }}
                  onClick={() => setFilter(id)}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {selectedDay && (
            <div style={{ marginBottom:12, fontSize:13, fontWeight:500, color:'var(--ink-3)' }}>
              Deadlines on {MONTH_NAMES[month]} {selectedDay}, {year}
            </div>
          )}

          {/* Empty state */}
          {deadlines.length === 0 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'var(--ink-3)', paddingTop:60 }}>
              <Icon.Calendar size={40}/>
              <div style={{ fontSize:16, fontWeight:600, color:'var(--ink-2)' }}>No deadlines yet</div>
              <div style={{ fontSize:14, maxWidth:340, textAlign:'center' }}>
                Add scholarship deadlines, program application dates, or any important milestones to stay on track.
              </div>
              <button className="btn btn-primary" style={{ marginTop:8 }} onClick={() => setAddModal(true)}>
                <Icon.Plus size={13}/> Add your first deadline
              </button>
            </div>
          )}

          {deadlines.length > 0 && displayList.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--ink-3)', fontSize:13 }}>
              {selectedDay ? `No deadlines on this day` : `No ${filter} deadlines`}
            </div>
          )}

          {displayList.map(d => (
            <DeadlineRow key={d.id} deadline={d} onEdit={setEditEntry} onDelete={handleDelete}/>
          ))}
        </div>
      </div>

      {/* Modals */}
      {addModal  && <DeadlineModal onSave={handleAdd}  onClose={() => setAddModal(false)}/>}
      {editEntry && <DeadlineModal entry={editEntry} onSave={handleEdit} onClose={() => setEditEntry(null)}/>}
    </div>
  );
}
