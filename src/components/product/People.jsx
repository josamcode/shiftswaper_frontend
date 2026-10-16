import React from 'react';

/*
 * Original geometric portrait illustrations used for the people tiles.
 * Purely decorative: every instance is aria-hidden.
 */

const SKIN = ['#F6D3B8', '#E7B48F', '#C98C64', '#9A6342', '#6E452C'];

export const PEOPLE = [
  { id: 'maya', name: 'Maya R.', role: 'Expert', skin: 1, hair: 'long', hairColor: '#2B1D16', shirt: '#2998FF', bg: '#DCEEFF' },
  { id: 'omar', name: 'Omar K.', role: 'Supervisor', skin: 2, hair: 'short', hairColor: '#1E1612', shirt: '#201C44', beard: true, bg: '#EDEAFB' },
  { id: 'lina', name: 'Lina S.', role: 'Expert', skin: 0, hair: 'bun', hairColor: '#8A4B2A', shirt: '#2FA77F', bg: '#E2F4EE' },
  { id: 'sara', name: 'Sara A.', role: 'Expert', skin: 2, hair: 'hijab', hairColor: '#3A365F', shirt: '#E9824A', bg: '#FDEBDF' },
  { id: 'david', name: 'David M.', role: 'Expert', skin: 4, hair: 'curly', hairColor: '#17110D', shirt: '#D9A514', bg: '#FCF3D7' },
  { id: 'karim', name: 'Karim H.', role: 'Supervisor', skin: 3, hair: 'cap', hairColor: '#201C44', shirt: '#F08A3C', beard: true, vest: true, bg: '#E8E1D8' },
  { id: 'nora', name: 'Nora T.', role: 'SME', skin: 0, hair: 'bob', hairColor: '#C99A4E', shirt: '#FFFFFF', bg: '#FCE7EA' },
  { id: 'yusuf', name: 'Yusuf B.', role: 'Moderator', skin: 3, hair: 'bald', hairColor: '#241812', shirt: '#7B6FD6', beard: true, bg: '#DCEEFF' },
  { id: 'hana', name: 'Hana F.', role: 'Expert', skin: 1, hair: 'hijab', hairColor: '#7B6FD6', shirt: '#201C44', bg: '#E2F4EE' },
  { id: 'ali', name: 'Ali N.', role: 'SME', skin: 2, hair: 'short', hairColor: '#3B2A20', shirt: '#2FA77F', bg: '#FCF3D7' },
];

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

export const PersonBust = ({ person, className = 'h-full w-full' }) => {
  const skin = SKIN[person.skin] || SKIN[1];
  const skinShade = shade(skin, -22);
  const hair = person.hairColor;
  const shirt = person.shirt;
  const isHijab = person.hair === 'hijab';

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" preserveAspectRatio="xMidYMax slice">
      {/* Long hair falls behind the shoulders */}
      {person.hair === 'long' && (
        <path d="M37 52c0-19 10-28 23-28s23 9 23 28l3 36c-9 5-43 5-52 0z" fill={hair} />
      )}

      {/* Shoulders */}
      <path d="M14 122c0-27 19-43 46-43s46 16 46 43z" fill={shirt} />
      {shirt.toUpperCase() === '#FFFFFF' && <path d="M14 122c0-27 19-43 46-43s46 16 46 43z" fill="none" stroke="#E8E1D8" strokeWidth="1.5" />}
      {person.vest && (
        <g>
          <path d="M30 122c2-20 10-33 22-38l8 20 8-20c12 5 20 18 22 38z" fill="#F7C548" opacity="0.95" />
          <path d="M40 108h12M68 108h12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {!isHijab && <path d="M50 80l10 13 10-13" fill="none" stroke={shade(shirt, -35)} strokeWidth="2.2" strokeLinejoin="round" />}

      {/* Neck */}
      {!isHijab && <rect x="52" y="62" width="16" height="20" rx="7" fill={skinShade} />}

      {isHijab ? (
        <g>
          <path d="M34 58c0-22 11-34 26-34s26 12 26 34c0 16-7 26-26 32-19-6-26-16-26-32z" fill={hair} />
          <ellipse cx="60" cy="54" rx="14.5" ry="17" fill={skin} />
          <path d="M45 48c3-9 9-13 15-13s12 4 15 13c-4-5-9-7-15-7s-11 2-15 7z" fill={shade(hair, -18)} />
        </g>
      ) : (
        <g>
          {/* Ears */}
          <circle cx="41" cy="53" r="4.2" fill={skinShade} />
          <circle cx="79" cy="53" r="4.2" fill={skinShade} />
          {/* Head */}
          <ellipse cx="60" cy="50" rx="19" ry="21" fill={skin} />
        </g>
      )}

      {/* Beard */}
      {person.beard && <path d="M43 54c1 13 8 20 17 20s16-7 17-20c-4 6-9 8-17 8s-13-2-17-8z" fill={hair} opacity="0.92" />}

      {/* Face */}
      <ellipse cx="53" cy="51" rx="1.7" ry="2" fill="#201C44" />
      <ellipse cx="67" cy="51" rx="1.7" ry="2" fill="#201C44" />
      <path d="M55 59.5q5 3.6 10 0" fill="none" stroke={person.beard ? '#F6E7DA' : '#201C44'} strokeWidth="1.7" strokeLinecap="round" />
      <ellipse cx="48" cy="57" rx="3" ry="1.8" fill="#E86A6A" opacity="0.18" />
      <ellipse cx="72" cy="57" rx="3" ry="1.8" fill="#E86A6A" opacity="0.18" />

      {/* Hair styles */}
      {person.hair === 'short' && <path d="M40.5 49c-1.5-15 7-23 19.5-23 13 0 21 7 19.5 23-3-7-8-12-19.5-12S43.5 42 40.5 49z" fill={hair} />}
      {person.hair === 'long' && <path d="M40 50c-1-15 7-24 20-24s21 9 20 24c-6-9-12-13-20-13-6 4-14 9-20 13z" fill={hair} />}
      {person.hair === 'bob' && (
        <path d="M38 60c-3-22 6-34 22-34s25 12 22 34c-2-3-3-8-3-13-4-4-10-8-19-8s-15 4-19 8c0 5-1 10-3 13z" fill={hair} />
      )}
      {person.hair === 'bun' && (
        <g fill={hair}>
          <circle cx="60" cy="25" r="8.5" />
          <path d="M40.5 49c-1.5-15 7-22 19.5-22s21 7 19.5 22c-4-8-11-12-19.5-12s-15.5 4-19.5 12z" />
        </g>
      )}
      {person.hair === 'curly' && (
        <g fill={hair}>
          {[
            [42, 42, 7], [47, 33, 7.5], [56, 28, 8], [66, 28, 8], [74, 34, 7.5], [78, 43, 7],
            [51, 36, 6], [62, 34, 6], [70, 38, 6],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      )}
      {person.hair === 'cap' && (
        <g>
          <path d="M40 45c1-12 9-19 20-19s19 7 20 19z" fill={hair} />
          <path d="M58 45h33c0 3-2 5-5 5H58z" fill={shade(hair, 30)} />
          <circle cx="60" cy="27" r="2" fill={shade(hair, 40)} />
        </g>
      )}
      {person.hair === 'bald' && <path d="M43 40c4-8 10-11 17-11s13 3 17 11c-5-4-10-6-17-6s-12 2-17 6z" fill={skinShade} opacity="0.6" />}
    </svg>
  );
};

/** A square portrait tile on a pastel ground, optionally with a status chip. */
export const PersonTile = ({ person, chip, className = '', rounded = 'rounded-2xl' }) => (
  <div className={`relative overflow-hidden ${rounded} ${className}`} style={{ background: person.bg }}>
    <PersonBust person={person} />
    {chip && (
      <div className="absolute inset-x-2 bottom-2 flex justify-center">
        <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-semibold text-ink shadow-soft">
          {chip}
        </span>
      </div>
    )}
  </div>
);

export const Initials = ({ name, color = '#2998FF', className = 'h-8 w-8 text-[11px]' }) => {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ background: color }}
    >
      {initials}
    </span>
  );
};

/** Small round portrait (person illustration cropped to a circle). */
export const Face = ({ person, className = 'h-8 w-8' }) => (
  <span className={`inline-block shrink-0 overflow-hidden rounded-full ring-2 ring-white ${className}`} style={{ background: person.bg }}>
    <PersonBust person={person} />
  </span>
);
