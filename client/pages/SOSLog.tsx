import { getSOSLogs } from "@/lib/sos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SOSLog() {
  const logs = getSOSLogs();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-red-600" /> SOS Log</h1>
        </div>

        {logs.length === 0 && (
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle>No SOS alerts yet</CardTitle>
              <CardDescription>Use the SOS button on Dashboard to send an alert.</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="space-y-3">
          {logs.map((l) => (
            <Card key={l.id} className="bg-white/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{new Date(l.timestamp).toLocaleString()}</span>
                  <Badge variant="secondary">Saved</Badge>
                </CardTitle>
                <CardDescription className="break-words whitespace-pre-wrap">{l.message}</CardDescription>
              </CardHeader>
              {l.mapsLink && (
                <CardContent className="pt-0">
                  <a href={l.mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                    <MapPin className="h-4 w-4" /> View on Map
                  </a>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
