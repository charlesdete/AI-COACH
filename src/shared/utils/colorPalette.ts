// Color palette extracted from existing design system
export const colorPalette = {
  // Primary colors
  accent: '#000080',
  accentLight: '#4d79ff',
  
  // Text colors
  textPrimary: '#6b6375',
  textHeading: '#08060d',
  textHeadingDark: '#f3f4f6',
  textDark: '#9ca3af',
  
  // Background colors
  bgLight: '#fff',
  bgDark: '#16171d',
  
  // Border colors
  borderLight: '#e5e4e7',
  borderDark: '#2e303a',
  
  // Code background
  codeBgLight: '#f4f3ec',
  codeBgDark: '#1f2028',
  
  // Accent backgrounds
  accentBgLight: 'rgba(0, 0, 128, 0.1)',
  accentBgDark: 'rgba(77, 121, 255, 0.15)',

  // Border accents
  accentBorderLight: 'rgba(0, 0, 128, 0.5)',
  accentBorderDark: 'rgba(77, 121, 255, 0.5)',
  
  // Social backgrounds
  socialBgLight: 'rgba(244, 243, 236, 0.5)',
  socialBgDark: 'rgba(47, 48, 58, 0.5)',
};

// CSS Variable names for use in stylesheets
export const cssVariables = {
  text: 'var(--text)',
  textHeading: 'var(--text-h)',
  bg: 'var(--bg)',
  border: 'var(--border)',
  codeBg: 'var(--code-bg)',
  accent: 'var(--accent)',
  accentBg: 'var(--accent-bg)',
  accentBorder: 'var(--accent-border)',
  socialBg: 'var(--social-bg)',
  shadow: 'var(--shadow)',
};

// Additional theme colors for role-based interfaces
export const roleColors = {
  admin: '#0066cc',    // Blue
  coach: '#00aa44',    // Green
  teacher: '#ff6600',  // Orange
};
