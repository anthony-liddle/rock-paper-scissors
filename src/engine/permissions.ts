import type { PermissionType, PermissionHistoryEntry } from '@engine/types';
import { holdStream } from '@engine/mediaStreamHolder';

interface PermissionThreshold {
  type: PermissionType;
  threshold: number;
}

export const PERMISSION_THRESHOLDS: PermissionThreshold[] = [
  { type: 'notification', threshold: 20 },
  { type: 'geolocation', threshold: 40 },
  { type: 'camera', threshold: 60 },
  { type: 'microphone', threshold: 70 },
  { type: 'fullscreen', threshold: 80 },
];

// Returns the next permission to request based on tension score and history
export function getNextPermission(
  tensionScore: number,
  history: PermissionHistoryEntry[],
): PermissionType | null {
  const handled = new Set(history.map((h) => h.type));
  for (const { type, threshold } of PERMISSION_THRESHOLDS) {
    if (tensionScore >= threshold && !handled.has(type)) {
      return type;
    }
  }
  return null;
}

export interface PermissionResult {
  granted: boolean;
  data?: string;
}

// Requests notification permission and shows a temporary notification
async function requestNotification(): Promise<PermissionResult> {
  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      // Small delay to ensure permission state is fully committed
      await new Promise((r) => setTimeout(r, 300));
      const n = new Notification('RO-SHAM-BO.EXE', {
        body: 'I see you.',
        requireInteraction: false,
      });
      // Keep a reference so GC doesn't collect it prematurely
      setTimeout(() => n.close(), 8000);
      return { granted: true };
    }
    return { granted: false };
  } catch {
    return { granted: false };
  }
}

// Requests geolocation permission and returns the city name
async function requestGeolocation(): Promise<PermissionResult> {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
      });
    });

    const { latitude, longitude } = position.coords;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'User-Agent': 'RO-SHAM-BO.EXE/1.0' } },
      );
      const data = await response.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        'your location';
      return { granted: true, data: city };
    } catch {
      return { granted: true, data: 'your location' };
    }
  } catch {
    return { granted: false };
  }
}

// Requests camera permission and returns a media stream
async function requestCamera(): Promise<PermissionResult> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    holdStream(stream); // keep stream active so camera indicator light stays on
    return { granted: true };
  } catch {
    return { granted: false };
  }
}

// Requests microphone permission and returns a media stream
async function requestMicrophone(): Promise<PermissionResult> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    holdStream(stream); // keep stream active so microphone indicator light stays on
    return { granted: true };
  } catch {
    return { granted: false };
  }
}

// Requests fullscreen permission and returns a boolean
async function requestFullscreen(): Promise<PermissionResult> {
  try {
    await document.documentElement.requestFullscreen();
    return { granted: true };
  } catch {
    return { granted: false };
  }
}

// Requests a browser permission and returns a boolean
export async function requestBrowserPermission(
  type: PermissionType,
): Promise<PermissionResult> {
  switch (type) {
    case 'notification':
      return requestNotification();
    case 'geolocation':
      return requestGeolocation();
    case 'camera':
      return requestCamera();
    case 'microphone':
      return requestMicrophone();
    case 'fullscreen':
      return requestFullscreen();
  }
}
