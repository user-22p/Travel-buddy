export type Coords = { lat: number; lng: number; accuracy?: number };
export type SOSAlert = {
  id: string;
  timestamp: number;
  coords: Coords | null;
  mapsLink: string | null;
  message: string;
};

const SOS_KEY = "tb_sos_logs";
const PROFILE_KEY = "tb_profile";

export type SavedProfile = {
  name?: string;
  mobileNumber?: string;
  [k: string]: unknown;
};

export function getSavedProfile(): SavedProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as SavedProfile) : null;
  } catch {
    return null;
  }
}

export function getCurrentPosition(opts?: PositionOptions): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...(opts || {}) }
    );
  });
}

export function makeMapsLink(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export function getSOSLogs(): SOSAlert[] {
  try {
    const raw = localStorage.getItem(SOS_KEY);
    return raw ? (JSON.parse(raw) as SOSAlert[]) : [];
  } catch {
    return [];
  }
}

export function addSOSLog(entry: SOSAlert) {
  const logs = getSOSLogs();
  logs.unshift(entry);
  localStorage.setItem(SOS_KEY, JSON.stringify(logs));
}

export function buildAlertMessage(coords: Coords | null) {
  const profile = getSavedProfile();
  const name = profile?.name || "Unknown";
  const mobile = profile?.mobileNumber || "Unknown";
  const when = new Date().toLocaleString();
  let base = `SOS ALERT\nName: ${name}\nMobile: ${mobile}\nTime: ${when}`;
  if (coords) {
    const link = makeMapsLink(coords.lat, coords.lng);
    base += `\nLocation: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}\nMap: ${link}`;
  } else {
    base += `\nLocation: Not available`;
  }
  base += `\nPlease respond immediately.`;
  return base;
}

export async function shareAlert(message: string, url?: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title: "SOS Alert", text: message, url });
      return true;
    } catch {
      return false;
    }
  }
  try {
    await navigator.clipboard.writeText(url ? `${message}\n${url}` : message);
    return true;
  } catch {
    return false;
  }
}
