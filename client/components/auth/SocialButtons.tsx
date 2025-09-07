import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 mr-2" viewBox="0 0 533.5 544.3" aria-hidden>
      <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.7-36.5-4.9-54H272v102.2h147.1c-6.3 34.1-25 63-53.3 82.3v68h86.1c50.3-46.3 81.6-114.6 81.6-198.5z"/>
      <path fill="#34A853" d="M272 544.3c72.7 0 133.8-24 178.4-65.4l-86.1-68c-23.9 16.1-54.5 25.6-92.3 25.6-70.9 0-131-47.8-152.4-111.9h-89.7v70.3C73.8 486.6 165.8 544.3 272 544.3z"/>
      <path fill="#FBBC05" d="M119.6 324.6c-10.3-30.9-10.3-64.1 0-95l.1-70.3H30c-39.7 78.9-39.7 171.7 0 250.6l89.6-70.3z"/>
      <path fill="#EA4335" d="M272 107.7c39.5-.6 77.4 14.6 106.4 42.6l79.3-79.3C405.7 24.8 344.6.5 272 0 165.8 0 73.8 57.8 30 146.7l89.6 70.3C141 152.9 201.1 105.1 272 105.1z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-4 w-4 mr-2" viewBox="0 0 448 512" aria-hidden>
      <path fill="currentColor" d="M224 202.7A53.3 53.3 0 1 0 277.3 256 53.38 53.38 0 0 0 224 202.7zm124.7-41a54 54 0 0 0-30.6-30.6c-21.2-8.4-71.5-6.5-94.1-6.5s-72.9-1.9-94.1 6.5a54 54 0 0 0-30.6 30.6c-8.4 21.2-6.5 71.5-6.5 94.1s-1.9 72.9 6.5 94.1a54 54 0 0 0 30.6 30.6c21.2 8.4 71.5 6.5 94.1 6.5s72.9 1.9 94.1-6.5a54 54 0 0 0 30.6-30.6c8.4-21.2 6.5-71.5 6.5-94.1s1.9-72.9-6.5-94.1zM224 338a82 82 0 1 1 82-82 82 82 0 0 1-82 82zm85.4-148.6a19.2 19.2 0 1 1 19.2-19.2 19.2 19.2 0 0 1-19.2 19.2z"/>
    </svg>
  );
}

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SocialButtons({ className = "" }: { className?: string }) {
  const [providers, setProviders] = useState<{ google: boolean; instagram: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (active) setProviders(j);
      })
      .catch(() => setProviders({ google: false, instagram: false }));
    return () => {
      active = false;
    };
  }, []);

  const go = (path: string, enabled: boolean) => {
    if (!enabled) {
      toast.error("This sign-in method is not configured");
      return;
    }
    window.location.href = path;
  };

  const googleEnabled = providers?.google ?? false;
  const igEnabled = providers?.instagram ?? false;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <Button
        variant="outline"
        className="w-full border-neutral-300 bg-white text-black hover:bg-neutral-50 disabled:opacity-60"
        onClick={() => go("/api/auth/google", googleEnabled)}
        disabled={!googleEnabled}
        aria-disabled={!googleEnabled}
        aria-label="Continue with Google"
      >
        <GoogleIcon />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full text-white disabled:opacity-60"
        style={{
          background:
            "linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)",
        }}
        onClick={() => go("/api/auth/instagram", igEnabled)}
        disabled={!igEnabled}
        aria-disabled={!igEnabled}
        aria-label="Continue with Instagram"
      >
        <InstagramIcon />
        Continue with Instagram
      </Button>
    </div>
  );
}

export default SocialButtons;
