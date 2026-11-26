import { useState } from "react";

// Logo skill: memakai link SVG di bawah. Jika link gagal dimuat, otomatis pakai SVG inline sebagai cadangan.
const I = {
  React: (
    <svg viewBox="-12 -12 24 24" fill="none" stroke="#61dafb" strokeWidth="1.1">
      <circle r="2" fill="#61dafb" stroke="none" />
      <ellipse rx="10" ry="4" />
      <ellipse rx="10" ry="4" transform="rotate(60)" />
      <ellipse rx="10" ry="4" transform="rotate(120)" />
    </svg>
  ),
  "Node.js": (
    <svg viewBox="0 0 24 24">
      <path d="M12 1.5l9 5.2v10.6l-9 5.2-9-5.2V6.7z" fill="#5fa04e" />
      <path d="M12 7.2v9.6M9 9.5l3-2 3 2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    </svg>
  ),
  Firebase: (
    <svg viewBox="0 0 24 24">
      <path d="M4.5 18.5L6.8 3.6c.1-.5.7-.6.9-.2l2.4 4.5z" fill="#ffa000" />
      <path d="M13.2 10.4l-2.3-4.2c-.2-.3-.6-.3-.8 0L4.5 18.5z" fill="#f57c00" />
      <path d="M4.5 18.5l7 3.6c.3.1.7.1 1 0l7-3.6L17 5.3c-.1-.5-.7-.6-.9-.2z" fill="#ffca28" />
      <path d="M12 22.1l7.5-3.6" stroke="#ff8f00" strokeWidth=".4" />
    </svg>
  ),
  "C#": (
    <svg viewBox="0 0 24 24">
      <path d="M12 1.5l9 5.2v10.6l-9 5.2-9-5.2V6.7z" fill="#7b3fe4" />
      <text x="12" y="16" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">C#</text>
    </svg>
  ),
  HTML: (
    <svg viewBox="0 0 24 24">
      <path d="M3 2h18l-1.6 17.5L12 22l-7.4-2.5z" fill="#e44d26" />
      <path d="M12 3.8v16.4l6-2 1.3-14.4z" fill="#f16529" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">5</text>
    </svg>
  ),
  CSS: (
    <svg viewBox="0 0 24 24">
      <path d="M3 2h18l-1.6 17.5L12 22l-7.4-2.5z" fill="#1572b6" />
      <path d="M12 3.8v16.4l6-2 1.3-14.4z" fill="#33a9dc" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">3</text>
    </svg>
  ),
  Git: (
    <svg viewBox="0 0 24 24">
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="2.2" transform="rotate(45 12 12)" fill="#f05032" />
      <path d="M9.5 8.5v7M9.5 11.5h4.5l1.5-1.5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="8.3" r="1.5" fill="#fff" />
      <circle cx="9.5" cy="15.7" r="1.5" fill="#fff" />
      <circle cx="15.5" cy="9.8" r="1.5" fill="#fff" />
    </svg>
  ),
  Blender: (
    <svg viewBox="0 0 24 24">
      <path d="M3 15.5c0-4 2.6-7.3 6.2-8.2l5.5-4.5c.8-.6 1.8.1 1.4 1l-1.8 3.7c3.4 1 5.7 3.9 5.7 7.6 0 4.6-4 7.9-9 7.9s-8-3.4-8-7.5z" fill="#f5792a" />
      <circle cx="13" cy="15" r="4.3" fill="#265787" />
      <circle cx="13" cy="15" r="2.3" fill="#fff" />
    </svg>
  ),
  Unity: (
    <svg viewBox="0 0 24 24">
      <path d="M12 1.5l9 5.2v10.6l-9 5.2-9-5.2V6.7z" fill="#2b2b2b" stroke="#fff" strokeWidth="1" />
      <path d="M12 6l4.6 3v6L12 18l-4.6-3V9z M12 6v6m0 0l-4.6-3M12 12l4.6-3M12 12v6" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinejoin="round" />
    </svg>
  ),
  Figma: (
    <svg viewBox="0 0 12 18">
      <path d="M3 0h3v6H3a3 3 0 010-6z" fill="#f24e1e" />
      <path d="M6 0h3a3 3 0 010 6H6z" fill="#ff7262" />
      <path d="M3 6h3v6H3a3 3 0 010-6z" fill="#a259ff" />
      <circle cx="9" cy="9" r="3" fill="#1abcfe" />
      <path d="M3 12h3v3a3 3 0 11-3-3z" fill="#0acf83" />
    </svg>
  ),
  Affinity: (
    <svg viewBox="0 0 24 24">
      <defs>
        <linearGradient id="afg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3fb4ff" />
          <stop offset="1" stopColor="#1263c4" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#afg)" />
      <path d="M5.6 19L12 5l6.4 14" stroke="#fff" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.6 14.6h6.8" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  ),
  Canva: (
    <svg viewBox="0 0 24 24">
      <defs>
        <linearGradient id="cvg" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0" stopColor="#00c4cc" />
          <stop offset="1" stopColor="#7d2ae8" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11.5" fill="url(#cvg)" />
      <path d="M16.2 8.9A4.7 4.7 0 1016.2 15.1" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  ),
};

// Ikon kontak / sosial (dipakai di footer)
export const SocialIcon = ({ name }) => {
  const p = { viewBox: "0 0 24 24", width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  switch (name) {
    case "GitHub":
      return <svg {...p}><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /></svg>;
    case "Gmail":
      return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
    case "Instagram":
      return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" /></svg>;
    case "WhatsApp":
      return <svg {...p}><path d="M3 21l1.65-4.9A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8a4 4 0 01-2-2l.8-1-1-2z" /></svg>;
    default:
      return null;
  }
};

const DEV = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";
export const iconUrls = {
  React: `${DEV}/react/react-original.svg`,
  "Node.js": `${DEV}/nodejs/nodejs-original.svg`,
  Firebase: "https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg",
  "C#": `${DEV}/csharp/csharp-original.svg`,
  HTML: `${DEV}/html5/html5-original.svg`,
  CSS: `${DEV}/css3/css3-original.svg`,
  Git: "https://www.vectorlogo.zone/logos/git-scm/git-scm-icon.svg",
  Blender: `${DEV}/blender/blender-original.svg`,
  Unity: `${DEV}/unity/unity-original.svg`,
  Figma: "https://www.vectorlogo.zone/logos/figma/figma-icon.svg",
  Affinity: "/assets/affinity.svg",
  Canva: "/assets/canva.svg",
};

export default function Icon({ name }) {
  const [failed, setFailed] = useState(false);
  const url = iconUrls[name];
  if (url && !failed) {
    return (
      <span className="ico">
        <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />
      </span>
    );
  }
  return I[name] ? <span className="ico" aria-hidden="true">{I[name]}</span> : null;
}
