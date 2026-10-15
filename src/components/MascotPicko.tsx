import { useMemo } from "react";

export type PickoMood = "cheer" | "listen" | "celebrate" | "wink";

interface MascotPickoProps {
  mood?: PickoMood;
  size?: number;
  speech?: string;
  className?: string;
}

export function MascotPicko({ mood = "cheer", size = 80, speech, className = "" }: MascotPickoProps) {
  return (
    <div className={`picko-wrapper ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: "1rem" }}>
      <div className="picko-avatar" style={{ width: size, height: size, flexShrink: 0, position: "relative" }}>
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.06))", overflow: "visible" }}
          aria-label="吉他拨片伙伴 Picko"
          role="img"
        >
          {/* Headband / Headphone arch */}
          <path
            d="M 20 45 C 20 18, 80 18, 80 45"
            stroke="#4b5563"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Pick Body - rounded top, tapered triangular bottom */}
          {/* 3D bottom shade */}
          <path
            d="M 22 28 C 12 40, 16 68, 50 94 C 84 68, 88 40, 78 28 C 70 18, 30 18, 22 28 Z"
            fill="var(--color-brand-shade, #cc7800)"
          />
          {/* Pick Body Main */}
          <path
            d="M 22 26 C 12 38, 16 66, 50 90 C 84 66, 88 38, 78 26 C 70 16, 30 16, 22 26 Z"
            fill="var(--color-brand, #ff9600)"
          />

          {/* Pick Highlight shine */}
          <path
            d="M 28 26 C 24 35, 27 50, 36 60"
            stroke="#ffc466"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Headphone earcups */}
          <rect x="14" y="38" width="9" height="18" rx="4.5" fill="#374151" />
          <rect x="77" y="38" width="9" height="18" rx="4.5" fill="#374151" />
          <rect x="16" y="41" width="5" height="12" rx="2.5" fill="var(--color-sky, #1cb0f6)" />
          <rect x="79" y="41" width="5" height="12" rx="2.5" fill="var(--color-sky, #1cb0f6)" />

          {/* Cheeks blush */}
          <circle cx="33" cy="50" r="5" fill="#ff7a00" opacity="0.45" />
          <circle cx="67" cy="50" r="5" fill="#ff7a00" opacity="0.45" />

          {/* Eyes & Mouth according to mood */}
          {mood === "listen" ? (
            <>
              <path d="M 32 44 Q 38 41 44 44" stroke="#2c1a04" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 56 44 Q 62 41 68 44" stroke="#2c1a04" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="50" cy="54" r="3" fill="#2c1a04" />
              <g transform="translate(68, 16) scale(0.7)">
                <path d="M10 15V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" stroke="var(--color-sky, #1cb0f6)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="8" cy="15" r="3.5" fill="var(--color-sky, #1cb0f6)" />
              </g>
            </>
          ) : mood === "celebrate" ? (
            <>
              <path d="M 32 42 Q 38 36 44 42" stroke="#2c1a04" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 56 42 Q 62 36 68 42" stroke="#2c1a04" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 40 48 Q 50 64 60 48 Z" fill="#6e1400" />
              <path d="M 45 55 Q 50 61 55 55" fill="#ff6464" />
            </>
          ) : mood === "wink" ? (
            <>
              <path d="M 33 43 Q 38 47 43 43" stroke="#2c1a04" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <circle cx="62" cy="42" r="5" fill="#2c1a04" />
              <circle cx="64" cy="40" r="1.8" fill="#ffffff" />
              <path d="M 44 50 Q 52 57 58 51" stroke="#2c1a04" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="38" cy="42" r="5.5" fill="#2c1a04" />
              <circle cx="40" cy="40" r="2" fill="#ffffff" />
              <circle cx="62" cy="42" r="5.5" fill="#2c1a04" />
              <circle cx="64" cy="40" r="2" fill="#ffffff" />
              <path d="M 42 51 Q 50 59 58 51" stroke="#2c1a04" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          )}
        </svg>
      </div>

      {speech ? (
        <div className="picko-bubble" role="note">
          <p>{speech}</p>
        </div>
      ) : null}
    </div>
  );
}

const RANDOM_TIPS = [
  "今天耳朵借你用 5 分钟，剩下的靠手感！",
  "弹错没关系，琴弦知道你在找它。",
  "听不清时先哼出来，声音有了位置就有了。",
  "哪怕只练 10 分钟，指尖也记住了音色。",
  "多邻国练口语，咱们在这里把耳朵练灵！",
  "先听大方向，再扣细节，不用碰运气。",
];

export function usePickoQuote(initialIndex?: number): string {
  return useMemo(() => {
    if (typeof initialIndex === "number") {
      return RANDOM_TIPS[initialIndex % RANDOM_TIPS.length];
    }
    return RANDOM_TIPS[Math.floor(Math.random() * RANDOM_TIPS.length)];
  }, [initialIndex]);
}
