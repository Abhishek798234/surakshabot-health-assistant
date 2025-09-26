// Mobile device detection and utilities
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Prevent zoom on input focus (iOS)
export const preventZoom = () => {
  if (isIOS()) {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }
};

// Optimize for mobile performance
export const optimizeForMobile = () => {
  // Disable hover effects on touch devices
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  }
  
  // Add platform-specific classes
  if (isIOS()) {
    document.body.classList.add('ios');
  } else if (isAndroid()) {
    document.body.classList.add('android');
  }
  
  // Prevent zoom on input focus
  preventZoom();
};