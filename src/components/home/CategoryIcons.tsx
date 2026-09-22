import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

/**
 * 1. IP Camera Icon
 * Clean monoline vector with bold outline, rounded caps, smart turret dome, lens ring & signal waves.
 */
export function IpCameraCategoryIcon({ size = 56, color = 'currentColor', className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Ceiling Mount Base Plate */}
      <path d="M16 12H48" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M22 12V16" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M42 12V16" stroke={color} strokeWidth="3" strokeLinecap="round" />

      {/* Smooth Turret / Dome Casing */}
      <path
        d="M15 17H49C49 17 51 37 32 37C13 37 15 17 15 17Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Glass Lens */}
      <circle cx="32" cy="26.5" r="7.5" stroke={color} strokeWidth="3" />
      <circle cx="32" cy="26.5" r="2.5" fill={color} />
      {/* Lens Reflection Highlight */}
      <path d="M29.5 23.5A4.5 4.5 0 0 1 34.5 24" stroke={color} strokeWidth="1.8" strokeLinecap="round" />

      {/* IR Night Vision Sensor Dots */}
      <circle cx="21" cy="24.5" r="1.5" fill={color} />
      <circle cx="43" cy="24.5" r="1.5" fill={color} />

      {/* Smart Broadcast Waves at Bottom */}
      <path d="M25 43C27.2 45.2 29.5 46 32 46C34.5 46 36.8 45.2 39 43" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M21 48C24.3 51.3 28 52.5 32 52.5C36 52.5 39.7 51.3 43 48" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 2. CC Camera Icon
 * Clean monoline bullet security camera with sunshield visor, cylinder housing, joint and wall bracket.
 */
export function CcCameraCategoryIcon({ size = 56, color = 'currentColor', className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Sunshield Top Visor */}
      <path d="M10 18H45L50 23H10" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Main Bullet Housing */}
      <path
        d="M12 24H43L40 38H12C10.9 38 10 37.1 10 36V26C10 24.9 10.9 24 12 24Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Front Beveled Lens Cone */}
      <path d="M43 24L51 27V35L40 38" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M51 28.5C52.2 29.8 52.2 32.2 51 33.5" stroke={color} strokeWidth="2.8" strokeLinecap="round" />

      {/* Lens Center & Status LED */}
      <circle cx="45.5" cy="31" r="2.2" fill={color} />
      <circle cx="16" cy="31" r="1.5" fill={color} />
      <path d="M22 31H31" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

      {/* Articulated Mount Arm */}
      <path d="M22 38V45C22 46.1 21.1 47 20 47H15" stroke={color} strokeWidth="3" strokeLinecap="round" />

      {/* Wall Mounting Plate */}
      <path d="M12 41V53" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="44" r="1.2" fill={color} />
      <circle cx="12" cy="50" r="1.2" fill={color} />

      {/* Mini Wireless Antenna */}
      <path d="M15 24L11 15" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="10" cy="13" r="1.8" fill={color} />
    </svg>
  );
}

/**
 * 3. NVR / DVR Icon
 * Clean monoline network/digital video recorder unit with tray, power button, channel LEDs and USB ports.
 */
export function NvrDvrCategoryIcon({ size = 56, color = 'currentColor', className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Top Perspective Lid / Stacking Lip */}
      <path d="M14 18L19 13H51L56 18" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Main Chassis Box */}
      <rect x="8" y="18" width="48" height="28" rx="4" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Front Faceplate Divider */}
      <path d="M8 32H56" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />

      {/* HDD Tray Indicator */}
      <rect x="14" y="23" width="16" height="5" rx="1.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="17.5" cy="25.5" r="1" fill={color} />

      {/* Power Button */}
      <circle cx="48" cy="25.5" r="3.5" stroke={color} strokeWidth="2.5" />
      <path d="M48 23.5V26" stroke={color} strokeWidth="1.8" strokeLinecap="round" />

      {/* 4-Channel LED Status Dots */}
      <circle cx="15" cy="39" r="1.8" fill={color} />
      <circle cx="21" cy="39" r="1.8" fill={color} />
      <circle cx="27" cy="39" r="1.8" fill={color} />
      <circle cx="33" cy="39" r="1.8" fill={color} />

      {/* Front USB Ports */}
      <rect x="42" y="36.5" width="4.5" height="5" rx="1" stroke={color} strokeWidth="2" />
      <rect x="48.5" y="36.5" width="4.5" height="5" rx="1" stroke={color} strokeWidth="2" />

      {/* Rubber Feet */}
      <path d="M14 46V49" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 46V49" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 4. Networking Icon
 * Clean monoline Wi-Fi router / switch with dual angled antennas, radiating broadcast waves & ethernet ports.
 */
export function NetworkingCategoryIcon({ size = 56, color = 'currentColor', className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Dual Antennas */}
      <path d="M16 34L13 14" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="12.5" cy="12" r="2" fill={color} />
      <path d="M48 34L51 14" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="51.5" cy="12" r="2" fill={color} />

      {/* Radiating Wi-Fi Waves */}
      <path d="M28 25A6 6 0 0 1 36 25" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M23 20A13 13 0 0 1 41 20" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M19 15A19 19 0 0 1 45 15" stroke={color} strokeWidth="2.8" strokeLinecap="round" />

      {/* Main Router Chassis */}
      <rect x="8" y="34" width="48" height="18" rx="4" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 34L18 39H46L50 34" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />

      {/* Status LED Lights */}
      <circle cx="16" cy="44" r="1.8" fill={color} />
      <circle cx="22" cy="44" r="1.8" fill={color} />
      <circle cx="28" cy="44" r="1.8" fill={color} />

      {/* Gigabit Ports */}
      <rect x="36" y="41" width="5.5" height="5.5" rx="1" stroke={color} strokeWidth="2" />
      <rect x="44.5" y="41" width="5.5" height="5.5" rx="1" stroke={color} strokeWidth="2" />

      {/* Rubber Feet */}
      <path d="M14 52V55" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 52V55" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 5. Monitor Icon
 * Clean monoline security monitor screen with 4-channel surveillance quad view & desktop stand.
 */
export function MonitorCategoryIcon({ size = 56, color = 'currentColor', className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Outer Monitor Frame */}
      <rect x="7" y="10" width="50" height="34" rx="4" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Inner Screen Display */}
      <rect x="12" y="15" width="40" height="24" rx="1.5" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* 4-Channel Quad-Split Screen View */}
      <path d="M32 15V39" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 27H52" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* REC Indicator Dot & Play Glyph */}
      <circle cx="17" cy="20" r="1.5" fill={color} />
      <path d="M21 20H26" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M37 20L40 22L37 24Z" fill={color} />

      {/* Stand Neck */}
      <path d="M27 44L25 51" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M37 44L39 51" stroke={color} strokeWidth="3" strokeLinecap="round" />

      {/* Wide Desktop Base */}
      <path d="M18 53H46" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="41.5" r="1" fill={color} />
    </svg>
  );
}

/**
 * 6. Accessories Icon
 * Clean monoline security hardware & accessories case with handle, latch, connector & cables.
 */
export function AccessoriesCategoryIcon({ size = 56, color = 'currentColor', className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Top Handle */}
      <path d="M24 19V14C24 12.9 24.9 12 26 12H38C39.1 12 40 12.9 40 14V19" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Hardware Box Body */}
      <rect x="9" y="19" width="46" height="32" rx="4" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Center Divider & Latch */}
      <path d="M9 31H55" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <rect x="27" y="28" width="10" height="7" rx="1.5" stroke={color} strokeWidth="2.5" fill="none" />
      <circle cx="32" cy="31.5" r="1" fill={color} />

      {/* Cable / Wire Coil Accent */}
      <path d="M16 41C16 38 20 38 20 42C20 46 24 46 24 43" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="43" r="1.5" fill={color} />

      {/* Precision Tool / Connector Accent */}
      <path d="M41 38L47 44" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M45 37L48 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

      {/* Corner Rivet Details */}
      <circle cx="14" cy="24" r="1" fill={color} />
      <circle cx="50" cy="24" r="1" fill={color} />
    </svg>
  );
}
