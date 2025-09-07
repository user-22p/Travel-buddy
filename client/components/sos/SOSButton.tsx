import { useEffect, useState } from "react";
import { AlertTriangle, Phone, Share2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { addSOSLog, buildAlertMessage, getCurrentPosition, makeMapsLink } from "@/lib/sos";
import { useNavigate } from "react-router-dom";

export default function SOSButton() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(3);
  const [busy, setBusy] = useState(false);
  const [lastMsg, setLastMsg] = useState<string | null>(null);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setCount(3);
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [open]);

  const activateSOS = async () => {
    setBusy(true);
    try {
      let coords = null as null | { lat: number; lng: number; accuracy?: number };
      try {
        coords = await getCurrentPosition();
      } catch {
        coords = null;
      }
      const msg = buildAlertMessage(coords);
      const link = coords ? makeMapsLink(coords.lat, coords.lng) : null;

      addSOSLog({ id: crypto.randomUUID(), timestamp: Date.now(), coords, mapsLink: link, message: msg });
      setLastMsg(msg);
      setLastLink(link);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        aria-label="SOS"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 md:left-6 z-40 p-4 rounded-full shadow-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        <ShieldAlert className="h-5 w-5" />
      </button>

      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" /> Confirm SOS</AlertDialogTitle>
            <AlertDialogDescription>
              SOS will alert your contacts with your current location and prepare a call to emergency services. Activation in {count}s. You can cancel to prevent accidental activation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={count > 0 || busy} onClick={activateSOS}>
              {busy ? "Processing..." : count > 0 ? `Activate in ${count}s` : "Activate Now"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {lastMsg && (
        <div className="fixed bottom-40 left-4 right-4 md:left-6 md:right-auto md:w-[360px] z-40 bg-white border rounded-xl shadow-xl p-4">
          <div className="font-semibold mb-1">SOS alert prepared</div>
          <div className="text-sm text-muted-foreground mb-3">Your alert is ready to send and has been saved to your SOS log.</div>
          <div className="flex flex-wrap gap-2">
            <a href="tel:112" className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-md">
              <Phone className="h-4 w-4" /> Call 112
            </a>
            {lastLink && (
              <a
                href={lastLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border"
              >
                View Location
              </a>
            )}
            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border"
              onClick={async () => {
                const shareData: ShareData = { title: "SOS Alert", text: lastMsg || undefined, url: lastLink || undefined };
                try {
                  if (navigator.share) await navigator.share(shareData);
                  else await navigator.clipboard.writeText(`${lastMsg}\n${lastLink ?? ""}`.trim());
                } catch {}
              }}
            >
              <Share2 className="h-4 w-4" /> Share Alert
            </button>
            <Button variant="outline" onClick={() => navigate("/sos-log")}>View SOS Log</Button>
          </div>
        </div>
      )}
    </>
  );
}
