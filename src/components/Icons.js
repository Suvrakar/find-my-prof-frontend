import React from 'react';

// Helper: create a Lucide-style icon
const ic = (path) => ({ size = 16, color = "currentColor", strokeWidth = 1.75, style } = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {path}
  </svg>
);

export const Search = ic(<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>);
export const Home = ic(<><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></>);
export const Sparkles = ic(<><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7z"/></>);
export const Mail = ic(<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>);
export const Inbox = ic(<><path d="M3 13h4l2 3h6l2-3h4"/><path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/></>);
export const Bookmark = ic(<><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-4z"/></>);
export const User = ic(<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>);
export const Settings = ic(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>);
export const Chevron = ic(<path d="m9 6 6 6-6 6"/>);
export const ChevronDown = ic(<path d="m6 9 6 6 6-6"/>);
export const Plus = ic(<><path d="M12 5v14"/><path d="M5 12h14"/></>);
export const Check = ic(<path d="M5 13l4 4L19 7"/>);
export const X = ic(<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>);
export const Filter = ic(<path d="M3 5h18l-7 9v6l-4-2v-4z"/>);
export const Send = ic(<><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4z"/></>);
export const Clock = ic(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>);
export const Building = ic(<><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></>);
export const Award = ic(<><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></>);
export const Book = ic(<><path d="M4 4h14a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M4 4v16"/></>);
export const Globe = ic(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>);
export const ExternalLink = ic(<><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></>);
export const Star = ic(<path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.4L7.8 14 3 9.6l6.4-.6z"/>);
export const StarF = ({ size = 16, color = "currentColor" } = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.4L7.8 14 3 9.6l6.4-.6z"/>
  </svg>
);
export const Trend = ic(<><path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/></>);
export const Eye = ic(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>);
export const Reply = ic(<><path d="M9 17 4 12l5-5"/><path d="M4 12h11a5 5 0 0 1 5 5v2"/></>);
export const Printer = ic(<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>);
export const Download = ic(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>);
export const Camera = ic(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>);
export const AlertCircle  = ic(<><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>);
export const GraduationCap = ic(<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>);
export const Calendar      = ic(<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>);
export const Zap           = ic(<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>);
export const Paperclip     = ic(<><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></>);
export const Trash         = ic(<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>);
export const FileText      = ic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>);
export const Upload        = ic(<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>);
export const Kanban        = ic(<><rect x="3" y="3" width="5" height="11" rx="1"/><rect x="10" y="3" width="5" height="16" rx="1"/><rect x="17" y="3" width="5" height="7" rx="1"/></>);
export const MoreHoriz     = ic(<><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></>);

export const Dot = ({ size = 8, color = "currentColor" } = {}) => (
  <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }}/>
);

export const Logo = ({ size = 22 } = {}) => (
  <span className="brand-mark" style={{ width: size, height: size }}>
    <svg viewBox="0 0 22 22" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <polygon points="11,4 19,7.5 11,11 3,7.5" fill="currentColor"/>
      <path d="M5.5,9.5 Q5.5,15 11,17 Q16.5,15 16.5,9.5" fill="currentColor"/>
      <line x1="19" y1="7.5" x2="19" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="19" cy="14.8" r="1.6" fill="currentColor"/>
    </svg>
  </span>
);

// Map icon name string → component (used by INTERESTS)
export const Icon = {
  Search, Home, Sparkles, Mail, Inbox, Bookmark, User, Settings,
  Chevron, ChevronDown, Plus, Check, X, Filter, Send, Clock,
  Building, Award, Book, Globe, ExternalLink, Star, StarF, Trend, Eye, Reply,
  Dot, Logo, Printer, Download, Camera, AlertCircle, GraduationCap, Calendar,
  Zap, Paperclip, Trash, FileText, Upload, Kanban, MoreHoriz,
};

export default Icon;
