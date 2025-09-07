export type ChatMessage = { id: string; text: string; fromMe: boolean; ts: number };
export type ChatAnswer = { reply: string; needsClarification?: boolean };

const CHAT_LOG_KEY = "tb_chat_logs";

function lc(s: string) { return s.toLowerCase(); }

function getProfile() {
  try { const raw = localStorage.getItem('tb_profile'); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function getPlannerTasks() {
  try { const raw = localStorage.getItem('tb_planner_tasks'); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function getSOSLogs() {
  try { const raw = localStorage.getItem('tb_sos_logs'); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function isUnclear(question: string) {
  const q = lc(question).trim();
  if (!q) return true;
  if (q.length < 6) return true;
  const vague = ["help", "plan", "info", "suggest", "recommend", "trip", "itinerary"];
  const hasKeyword = vague.some(v => q.includes(v));
  const hasDetail = /(when|where|which|how much|budget|dates?|city|country|destination|sos|profile)/.test(q);
  return hasKeyword && !hasDetail;
}

function formatTasks(tasks: any[]) {
  if (!tasks?.length) return "No tasks found.";
  const done = tasks.filter((t:any)=>t.done).length;
  return `${tasks.length} tasks (${done} done): ` + tasks.slice(0,5).map((t:any)=>t.title).join(", ");
}

export function buildAnswer(question: string, history: ChatMessage[]): ChatAnswer {
  const profile = getProfile();
  const tasks = getPlannerTasks();
  const sos = getSOSLogs();
  const q = lc(question);

  if (isUnclear(question)) {
    return { needsClarification: true, reply: "Could you share more details? For example: dates, destination/city, budget, or what you want to do." };
  }

  // SOS queries
  if (/(sos|emergency|alert)/.test(q)) {
    const last = sos?.[0];
    if (!last) return { reply: "No SOS alerts found. You can tap the red SOS button or view logs at /sos-log." };
    return { reply: `Last SOS at ${new Date(last.timestamp).toLocaleString()}. ${last.mapsLink ? `Location: ${last.mapsLink}` : "Location unavailable."}` };
  }

  // Profile queries
  if (/(profile|my info|my details|mobile|aadhaar|city|country|state)/.test(q)) {
    if (!profile) return { reply: "I don’t have your profile yet. Please complete it in Profile > Setup." };
    const parts: string[] = [];
    if (profile.name) parts.push(`Name: ${profile.name}`);
    if (profile.mobileNumber) parts.push(`Mobile: ${profile.mobileNumber}`);
    if (profile.aadhaarNumber) parts.push(`Aadhaar: ${profile.aadhaarNumber}`);
    if (profile.originCity || profile.originState || profile.originCountry) parts.push(`From: ${[profile.originCity, profile.originState, profile.originCountry].filter(Boolean).join(', ')}`);
    return { reply: parts.length ? parts.join(" | ") : "Your profile has limited info. You can update it in Profile." };
  }

  // Planner / itinerary queries
  if (/(todo|task|plan|itinerary|checklist)/.test(q)) {
    return { reply: `Your planner: ${formatTasks(tasks)}. Open /planner to manage tasks.` };
  }

  // Destination quick answers (very simple demo)
  if (/(japan|kyoto|tokyo|osaka|iceland|thailand|peru)/.test(q)) {
    return { reply: "Top picks: book transport early, reserve lodging near transit, and add 2-3 flexible blocks per day. Need dates and budget to tailor more." };
  }

  // Fallback
  return { reply: "I’m not fully sure. Tell me your destination, dates, and budget, or open /planner to outline your trip." };
}

export function logChat(conversationId: string, question: string, answer: string) {
  try {
    const raw = localStorage.getItem(CHAT_LOG_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift({ id: crypto.randomUUID(), conversationId, ts: Date.now(), question, answer });
    localStorage.setItem(CHAT_LOG_KEY, JSON.stringify(logs));
  } catch {}
}
