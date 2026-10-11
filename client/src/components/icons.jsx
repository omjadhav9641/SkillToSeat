import React from 'react';

const shapes = {
  BookOpen: <><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v17H5.5A2.5 2.5 0 0 0 3 22z"/><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v17h6.5A2.5 2.5 0 0 1 21 22z"/></>,
  LayoutDashboard: <><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/></>,
  BriefcaseBusiness: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/></>,
  ClipboardList: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 10h8M8 14h8M8 18h5"/></>,
  LogOut: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
  Menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  X: <><path d="m18 6-12 12M6 6l12 12"/></>,
  Search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  Plus: <><path d="M12 5v14M5 12h14"/></>,
  Play: <><path d="m8 5 12 7-12 7z"/></>,
  CheckCircle2: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
  Flame: <><path d="M12 22c5 0 8-3.5 8-8 0-3-1.5-5.5-4-8-.3 2-1.5 3.5-3 4-1-4-3.5-7-6-9 0 4-1 6-3 9-1.2 1.7-2 3.3-2 5 0 4 3.5 7 10 7z"/></>,
  ArrowUpRight: <><path d="M7 17 17 7M7 7h10v10"/></>,
  Clock3: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  Building2: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 21v-3h4v3"/></>,
  MapPin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></>,
  ChevronRight: <><path d="m9 18 6-6-6-6"/></>,
  ShieldCheck: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/></>,
  Target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
  TrendingUp: <><path d="m3 17 6-6 4 4 8-8M15 7h6v6"/></>,
  Edit: <><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
  Trash2: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></>,
  RotateCcw: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5"/></>,
  Award: <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></>,
  Sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
  Moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
};

function makeIcon(name) {
  return function Icon({ size = 18, strokeWidth = 1.8, ...props }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {shapes[name]}
      </svg>
    );
  };
}

export const BookOpen = makeIcon('BookOpen');
export const LayoutDashboard = makeIcon('LayoutDashboard');
export const BriefcaseBusiness = makeIcon('BriefcaseBusiness');
export const ClipboardList = makeIcon('ClipboardList');
export const LogOut = makeIcon('LogOut');
export const Menu = makeIcon('Menu');
export const X = makeIcon('X');
export const Search = makeIcon('Search');
export const Plus = makeIcon('Plus');
export const Play = makeIcon('Play');
export const CheckCircle2 = makeIcon('CheckCircle2');
export const Flame = makeIcon('Flame');
export const ArrowUpRight = makeIcon('ArrowUpRight');
export const Clock3 = makeIcon('Clock3');
export const Building2 = makeIcon('Building2');
export const MapPin = makeIcon('MapPin');
export const ChevronRight = makeIcon('ChevronRight');
export const ShieldCheck = makeIcon('ShieldCheck');
export const Target = makeIcon('Target');
export const TrendingUp = makeIcon('TrendingUp');
export const Edit = makeIcon('Edit');
export const Trash2 = makeIcon('Trash2');
export const RotateCcw = makeIcon('RotateCcw');
export const Award = makeIcon('Award');
export const Sun = makeIcon('Sun');
export const Moon = makeIcon('Moon');
