"use client";

/** A small, original coin-and-sprout companion. Decorative: status is plain text. */
export function EarningsBuddy({ resting = false }: { resting?: boolean }) {
  return <svg className={`earnings-buddy${resting ? " resting" : ""}`} viewBox="0 0 160 140" fill="none" aria-hidden="true">
    <ellipse cx="80" cy="124" rx="49" ry="7" fill="#D8E8DD" />
    <circle cx="127" cy="28" r="14" fill="#F6CE77" />
    <path d="M127 7V3M148 28h5M143 12l4-4M108 12l-4-4" stroke="#E5B354" strokeWidth="2" strokeLinecap="round" />
    <path d="M77 46C59 40 58 24 62 17c14 0 24 11 18 28Z" fill="#7FBD98" stroke="#3B7557" strokeWidth="2" />
    <path d="M80 44c1-21 13-30 26-27 0 16-11 26-26 27Z" fill="#B6DCC0" stroke="#3B7557" strokeWidth="2" />
    <path d="M80 57V35" stroke="#3B7557" strokeWidth="2" strokeLinecap="round" />
    <path d="m54 109-9 12m56-12 10 12" stroke="#65523C" strokeWidth="5" strokeLinecap="round" />
    <circle cx="80" cy="81" r="39" fill="#F3D498" stroke="#977648" strokeWidth="2" />
    <circle cx="80" cy="81" r="31" stroke="#D5AF6D" strokeWidth="2" />
    {resting ? <path d="m66 79 5 2 5-2m12 0 5 2 5-2" stroke="#534738" strokeWidth="2.5" strokeLinecap="round" /> : <><ellipse cx="70" cy="80" rx="2.5" ry="4" fill="#534738" /><ellipse cx="91" cy="80" rx="2.5" ry="4" fill="#534738" /></>}
    <path d="M76 90q5 5 10 0" stroke="#534738" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="62" cy="88" rx="5" ry="3" fill="#E9AC85" /><ellipse cx="99" cy="88" rx="5" ry="3" fill="#E9AC85" />
  </svg>;
}
