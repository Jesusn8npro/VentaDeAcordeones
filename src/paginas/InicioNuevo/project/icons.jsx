/* global React */
const Icon = ({ name, size = 18 }) => {
  const s = size;
  const stroke = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'cart': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M3 4h2.5l2.5 12h11l2.5-9H6"/><circle cx="9" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg>);
    case 'search': return (<svg width={s} height={s} viewBox="0 0 24 24" className="icon-search" {...stroke}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
    case 'user': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>);
    case 'bell': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>);
    case 'heart': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 4 4 8-2.5 4.5-9.5 9-9.5 9z"/></svg>);
    case 'heart-fill': return (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 4 4 8-2.5 4.5-9.5 9-9.5 9z"/></svg>);
    case 'eye': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>);
    case 'arrow': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case 'arrow-left': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>);
    case 'plus': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 5v14M5 12h14"/></svg>);
    case 'minus': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M5 12h14"/></svg>);
    case 'x': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case 'check': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M4 12l5 5L20 6"/></svg>);
    case 'chev-down': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M6 9l6 6 6-6"/></svg>);
    case 'menu': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M3 6h18M3 12h18M3 18h18"/></svg>);
    case 'bolt': return (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>);
    case 'phone': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></svg>);
    case 'whatsapp': return (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.27-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.41-.56-.42-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.2.88 2.37 1 2.53.12.16 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg>);
    case 'tool': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M14.7 6.3a3 3 0 0 0 4 4l3.3 3.3a2.5 2.5 0 0 1-3.5 3.5l-3.3-3.3a3 3 0 0 0-4-4l-2-2a3 3 0 0 1 4-4l1.5 1.5z"/><path d="M4 4l6 6"/></svg>);
    case 'globe': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>);
    case 'sparkle': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></svg>);
    case 'shield': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>);
    case 'ig': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>);
    case 'fb': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M14 8h2V5h-2c-2 0-3 1-3 3v2H9v3h2v8h3v-8h2.5l.5-3H14V8z"/></svg>);
    case 'yt': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="2" y="6" width="20" height="12" rx="3"/><path d="m10 9 5 3-5 3z" fill="currentColor"/></svg>);
    case 'tt': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M14 4v10a4 4 0 1 1-4-4M14 4c0 3 2 5 5 5"/></svg>);
    /* Category icons */
    case 'cat-acc': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="6" height="16" rx="1.5"/><rect x="15" y="4" width="6" height="16" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h6"/></svg>);
    case 'cat-custom': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M14 3l7 7-11 11H3v-7L14 3z"/><path d="M12 5l7 7"/></svg>);
    case 'cat-strap': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M5 4h14M8 4v16a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4"/><path d="M10 8h4M10 12h4M10 16h4"/></svg>);
    case 'cat-case': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>);
    case 'cat-mic': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>);
    case 'cat-electro': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h4M7 14h2M15 10v4M18 12h-3"/></svg>);
    case 'cat-courses': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M2 7l10-4 10 4-10 4-10-4z"/><path d="M6 9v6c0 2 3 3 6 3s6-1 6-3V9"/></svg>);
    case 'cat-grid': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>);
    case 'sun': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>);
    case 'moon': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>);
    case 'map': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>);
    /* Multi-instrument category icons */
    case 'cat-guitar': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M14 4l3-2 3 3-2 3-2-1-2 2 1 2-7 7a3 3 0 1 1-3-3l7-7-1-2 2-2 1 2z"/><circle cx="7.5" cy="16.5" r="1.5"/></svg>);
    case 'cat-bass': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M9 2v4M11 4h4M11 8h4M11 12h4"/><path d="M7 16a5 5 0 1 0 10 0c0-2-1-3-3-4l-1-8h-2l-1 8c-2 1-3 2-3 4z"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>);
    case 'cat-drums': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><ellipse cx="12" cy="8" rx="9" ry="3"/><path d="M3 8v6c0 1.7 4 3 9 3s9-1.3 9-3V8"/><path d="M7 11v6M17 11v6M12 11v6"/></svg>);
    case 'cat-speaker': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><circle cx="12" cy="16" r="3"/></svg>);
    case 'cat-piano': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="6" width="18" height="12" rx="1"/><path d="M9 6v6M15 6v6M3 12h18"/></svg>);
    case 'pin': return (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a3 3 0 0 1 3 3v6l4 2v2H5v-2l4-2V5a3 3 0 0 1 3-3z"/></svg>);
    case 'star': return (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7 7 .6-5.3 4.7L18 22l-6-4-6 4 1.3-7.7L2 9.6 9 9z"/></svg>);
    /* Accordion accessories & technical parts */
    case 'acc-parrilla': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.2" fill="currentColor"/><circle cx="12" cy="9" r="1.2" fill="currentColor"/><circle cx="16" cy="9" r="1.2" fill="currentColor"/><circle cx="8" cy="13" r="1.2" fill="currentColor"/><circle cx="12" cy="13" r="1.2" fill="currentColor"/><circle cx="16" cy="13" r="1.2" fill="currentColor"/><circle cx="8" cy="17" r="1.2" fill="currentColor"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/><circle cx="16" cy="17" r="1.2" fill="currentColor"/></svg>);
    case 'acc-fuelle': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M3 6h2v12H3zM19 6h2v12h-2z"/><path d="M5 7l2 2-2 2 2 2-2 2 2 2M19 7l-2 2 2 2-2 2 2 2-2 2"/></svg>);
    case 'acc-broche': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="6" y="4" width="12" height="6" rx="1"/><path d="M10 10v8a2 2 0 0 1-4 0M14 10v8a2 2 0 0 0 4 0"/><circle cx="8" cy="18" r="1" fill="currentColor"/><circle cx="16" cy="18" r="1" fill="currentColor"/></svg>);
    case 'acc-lengueta': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="6" y="3" width="12" height="18" rx="1"/><path d="M10 6v12M14 6v12"/><circle cx="12" cy="6" r="1" fill="currentColor"/></svg>);
    case 'acc-resorte': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 3v3M12 18v3"/><path d="M7 6c0 1.5 5 2 5 3.5S7 11 7 12.5s5 1 5 2.5-5 1-5 2.5"/></svg>);
    case 'acc-celuloide': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>);
    case 'acc-tools': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M14.7 6.3a3 3 0 0 0 4 4l3.3 3.3a2.5 2.5 0 0 1-3.5 3.5l-3.3-3.3a3 3 0 0 0-4-4l-2-2a3 3 0 0 1 4-4l1.5 1.5z"/><path d="M4 4l6 6"/></svg>);
    case 'gift': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13"/><path d="M12 8c-2 0-4-2-3-4s4-1 3 4zM12 8c2 0 4-2 3-4s-4-1-3 4z"/></svg>);
    case 'mail': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>);
    case 'truck': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="2" y="7" width="12" height="10" rx="1"/><path d="M14 10h5l3 4v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>);
    default: return null;
  }
};

window.Icon = Icon;
