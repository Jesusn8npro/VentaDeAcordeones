import React from 'react'

export default function AcordeonSvg() {
  return (
    <div className="ap-product">
      <div className="ap-product-frame" id="ap-productFrame">
        <svg
          className="ap-accordion-svg"
          id="ap-accordionSvg"
          viewBox="0 0 600 630"
          xmlns="http://www.w3.org/2000/svg"
          data-stage="0"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ap-bodyRed" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#8a2424"/>
              <stop offset="50%"  stopColor="#3d0c0c"/>
              <stop offset="100%" stopColor="#1a0404"/>
            </linearGradient>
            <linearGradient id="ap-bodyPearl" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#fffaf0"/>
              <stop offset="35%"  stopColor="#f0e6d0"/>
              <stop offset="70%"  stopColor="#c8b894"/>
              <stop offset="100%" stopColor="#8a7448"/>
            </linearGradient>
            <linearGradient id="ap-goldMat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#ffe28a"/>
              <stop offset="45%"  stopColor="#FFC300"/>
              <stop offset="100%" stopColor="#8c6500"/>
            </linearGradient>
            <linearGradient id="ap-grilleBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#1c1c1c"/>
              <stop offset="100%" stopColor="#050505"/>
            </linearGradient>
            <linearGradient id="ap-foldGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#050505"/>
              <stop offset="50%"  stopColor="#2c2c2c"/>
              <stop offset="100%" stopColor="#050505"/>
            </linearGradient>
            <radialGradient id="ap-goldGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%"   stopColor="#FFC300" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#FFC300" stopOpacity="0"/>
            </radialGradient>
            <pattern id="ap-bellowsP" width="18" height="40" patternUnits="userSpaceOnUse">
              <rect width="18" height="40" fill="url(#ap-foldGrad)"/>
            </pattern>
            <pattern id="ap-lozenges" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M9 2 L16 9 L9 16 L2 9 Z" fill="#000" opacity="0.85"/>
            </pattern>
            <pattern id="ap-dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="7" cy="7" r="2.4" fill="#000" opacity="0.9"/>
            </pattern>
          </defs>

          <ellipse className="l4" cx="300" cy="315" rx="300" ry="300" fill="url(#ap-goldGlow)"/>
          <ellipse cx="300" cy="560" rx="230" ry="16" fill="#000" opacity="0.55"/>

          <g className="body-group">
            <path d="M 130,165 C 100,90 130,55 165,48" stroke="#0a0606" strokeWidth="6" fill="none"/>
            <path d="M 470,165 C 500,90 470,55 435,48" stroke="#0a0606" strokeWidth="6" fill="none"/>

            <g>
              <rect x="200" y="188" width="200" height="264" fill="url(#ap-bellowsP)"/>
              <g stroke="#000" strokeWidth="0.6" opacity="0.5">
                <line x1="200" y1="232" x2="400" y2="232"/>
                <line x1="200" y1="288" x2="400" y2="288"/>
                <line x1="200" y1="344" x2="400" y2="344"/>
                <line x1="200" y1="400" x2="400" y2="400"/>
              </g>
              <rect x="196" y="178" width="208" height="12" fill="#161616"/>
              <rect x="196" y="450" width="208" height="12" fill="#161616"/>
              <rect x="196" y="178" width="16" height="16" fill="#5a1010"/>
              <rect x="388" y="178" width="16" height="16" fill="#5a1010"/>
              <rect x="196" y="446" width="16" height="16" fill="#5a1010"/>
              <rect x="388" y="446" width="16" height="16" fill="#5a1010"/>
              <rect className="l2" x="196" y="178" width="208" height="3" fill="url(#ap-goldMat)"/>
              <rect className="l2" x="196" y="459" width="208" height="3" fill="url(#ap-goldMat)"/>
              <circle cx="204" cy="186" r="2" fill="#3a3a3a"/>
              <circle cx="396" cy="186" r="2" fill="#3a3a3a"/>
              <circle cx="204" cy="454" r="2" fill="#3a3a3a"/>
              <circle cx="396" cy="454" r="2" fill="#3a3a3a"/>
            </g>

            <g>
              <rect x="60" y="160" width="140" height="310" rx="14" fill="url(#ap-bodyRed)"/>
              <rect className="l1" x="60" y="160" width="140" height="310" rx="14" fill="url(#ap-bodyPearl)"/>
              <rect x="74" y="174" width="112" height="282" rx="8" fill="#000" opacity="0.18"/>
              <rect x="74" y="174" width="112" height="282" rx="8" fill="none" stroke="#000" strokeWidth="1" opacity="0.55"/>
              <rect className="l2" x="76" y="176" width="108" height="278" rx="6" fill="none" stroke="url(#ap-goldMat)" strokeWidth="1.5"/>
              <g transform="translate(90 196)">
                <rect width="80" height="88" rx="3" fill="url(#ap-grilleBase)"/>
                <rect className="l2" width="80" height="88" rx="3" fill="url(#ap-goldMat)" opacity="0.92"/>
                <rect width="80" height="88" fill="url(#ap-dots)"/>
              </g>
              <g transform="translate(130 378)">
                <ellipse cx="0" cy="0" rx="46" ry="26" fill="#000" opacity="0.35"/>
                <ellipse className="l2" cx="0" cy="0" rx="46" ry="26" fill="none" stroke="url(#ap-goldMat)" strokeWidth="1.2"/>
                <text className="l3 engraved-name" x="0" y="8" textAnchor="middle" fontFamily="'Brush Script MT','Lucida Handwriting',cursive" fontSize="26" fontStyle="italic" fill="none" stroke="url(#ap-goldMat)" strokeWidth="1.2">Juan</text>
                <text className="l3" x="0" y="8" textAnchor="middle" fontFamily="'Brush Script MT','Lucida Handwriting',cursive" fontSize="26" fontStyle="italic" fill="url(#ap-goldMat)" opacity="0.85">Juan</text>
              </g>
              <rect x="62" y="162" width="3" height="306" rx="1.5" fill="#fff" opacity="0.10"/>
              <rect className="l1" x="62" y="162" width="5" height="306" rx="2.5" fill="#fff" opacity="0.45"/>
              <rect x="195" y="162" width="3" height="306" fill="#000" opacity="0.45"/>
            </g>

            <g>
              <rect x="400" y="160" width="140" height="310" rx="14" fill="url(#ap-bodyRed)"/>
              <rect className="l1" x="400" y="160" width="140" height="310" rx="14" fill="url(#ap-bodyPearl)"/>
              <rect x="414" y="174" width="112" height="282" rx="8" fill="#000" opacity="0.18"/>
              <rect x="414" y="174" width="112" height="282" rx="8" fill="none" stroke="#000" strokeWidth="1" opacity="0.55"/>
              <rect className="l2" x="416" y="176" width="108" height="278" rx="6" fill="none" stroke="url(#ap-goldMat)" strokeWidth="1.5"/>
              <g transform="translate(424 188)">
                <rect width="92" height="254" rx="3" fill="url(#ap-grilleBase)"/>
                <rect className="l2" width="92" height="254" rx="3" fill="url(#ap-goldMat)" opacity="0.95"/>
                <rect width="92" height="254" fill="url(#ap-lozenges)"/>
                <circle className="l2" cx="46" cy="127" r="22" fill="none" stroke="#000" strokeWidth="1.5" opacity="0.6"/>
                <circle className="l2" cx="46" cy="127" r="22" fill="none" stroke="url(#ap-goldMat)" strokeWidth="1.2"/>
              </g>
              <rect x="402" y="162" width="3" height="306" rx="1.5" fill="#fff" opacity="0.10"/>
              <rect className="l1" x="402" y="162" width="5" height="306" rx="2.5" fill="#fff" opacity="0.45"/>
              <rect x="535" y="162" width="3" height="306" fill="#000" opacity="0.45"/>
            </g>

            <g className="l4">
              <ellipse cx="100" cy="230" rx="12" ry="55" fill="#fff" opacity="0.4" transform="rotate(-10 100 230)"/>
              <ellipse cx="440" cy="230" rx="12" ry="55" fill="#fff" opacity="0.4" transform="rotate(-10 440 230)"/>
              <circle cx="155" cy="190" r="1.8" fill="#fff"/>
              <circle cx="445" cy="190" r="1.8" fill="#fff"/>
              <circle cx="515" cy="430" r="1.8" fill="#fff"/>
              <circle cx="88"  cy="430" r="1.8" fill="#fff"/>
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
