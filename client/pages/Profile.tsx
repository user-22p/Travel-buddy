import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Edit2, Save, Plus, X, User } from "lucide-react";
import SocialButtons from "@/components/auth/SocialButtons";
import { useNavigate } from "react-router-dom";
import ProfileSetup from "./ProfileSetup";
import BottomNav from "@/components/navigation/BottomNav";

interface MeResponse { user: { id: string; email: string | null; name: string | null; image: string | null; username: string | null } | null }
interface ProfileResponse { profile: { user_id: string; bio: string | null; preferences: any | null; traits: string[] | null } | null; completeness?: number }

const DEFAULT_TRAITS = ["Adventurous", "Planner", "Budget Traveler", "Foodie", "Photographer", "Night Owl", "Early Riser", "Cultural Explorer", "Nature Lover"];

export default function Profile() {
  const navigate = useNavigate();
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [profile, setProfile] = useState<ProfileResponse["profile"] | null>(null);
  const [completeness, setCompleteness] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState("");
  const [traitInput, setTraitInput] = useState("");
  const traits = profile?.traits ?? [];

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson: MeResponse = await meRes.json();
        if (!active) return;
        if (!meRes.ok || !meJson.user) {
          setMe(null);
          setLoading(false);
          return;
        }
        setMe(meJson.user);
        const pr = await fetch("/api/profile");
        if (pr.status === 503) {
          // storage not configured; still render basic
          setProfile(null);
          setCompleteness(0);
          setLoading(false);
          return;
        }
        const pj = await pr.json();
        if (!active) return;
        setProfile(pj.profile);
        setCompleteness(pj.completeness ?? 0);
        setBio(pj.profile?.bio ?? "");
      } catch (e) {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const initials = useMemo(() => {
    const n = me?.name || me?.email || me?.username || "User";
    return n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  }, [me]);

  const suggestedTraits = useMemo(() => DEFAULT_TRAITS.filter(t => !traits.includes(t)).slice(0, 6), [traits]);

  const onSave = async () => {
    if (!me) {
      toast.error("Please sign in to save your profile");
      navigate("/login");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, traits }),
      });
      if (res.status === 503) {
        toast.error("Profile storage not configured");
        return;
      }
      if (!res.ok) throw new Error("Failed to save");
      const j = await res.json();
      setProfile(j.profile);
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const addTrait = (t: string) => {
    if (!t) return;
    const nt = Array.from(new Set([...(traits || []), t])).slice(0, 12);
    setProfile({ ...(profile || { user_id: me?.id || "" }), bio: profile?.bio ?? null, preferences: profile?.preferences ?? null, traits: nt });
    setTraitInput("");
  };

  const removeTrait = (t: string) => {
    const nt = (traits || []).filter(x => x !== t);
    setProfile({ ...(profile || { user_id: me?.id || "" }), bio: profile?.bio ?? null, preferences: profile?.preferences ?? null, traits: nt });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence>
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="h-24 bg-white/60 rounded-xl shadow animate-pulse" />
              <div className="h-[320px] bg-white/60 rounded-xl shadow animate-pulse" />
            </motion.div>
          ) : !me ? (
            <ProfileSetup />
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                      {me?.image ? <AvatarImage src={me.image} alt={me?.name ?? "Profile image"} /> : <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>}
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{me?.name || me?.username || me?.email || "Your Profile"}</CardTitle>
                      <CardDescription>{me?.email || (me?.username ? `@${me.username}` : "")}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <Button onClick={onSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <Label htmlFor="bio" className="mb-2 block">Bio</Label>
                      <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about your travel style, favorite destinations, and what you're looking for in a travel buddy." className="min-h-32 bg-white/80" />
                      <p className="text-xs text-muted-foreground mt-1">Tip: Share at least 20 characters for a better completeness score.</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Personality & Traits</Label>
                        <div className="flex gap-2">
                          <Input placeholder="Add a trait" value={traitInput} onChange={(e) => setTraitInput(e.target.value)} className="h-9 w-40" />
                          <Button variant="secondary" className="h-9" onClick={() => addTrait(traitInput)}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(traits || []).map((t) => (
                          <Badge key={t} variant="secondary" className="px-3 py-1 rounded-full">
                            <span className="mr-1">{t}</span>
                            <button aria-label={`Remove ${t}`} onClick={() => removeTrait(t)} className="ml-1 inline-flex items-center justify-center rounded-full hover:text-destructive focus:outline-none focus:ring-2 focus:ring-primary/40">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      {suggestedTraits.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedTraits.map((t) => (
                              <Button key={t} variant="outline" size="sm" className="rounded-full" onClick={() => addTrait(t)}>
                                + {t}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="mb-1 block">Profile Completeness</Label>
                    <div className="rounded-lg border bg-white/70 p-4">
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span>{completeness}%</span>
                        <span className={completeness >= 80 ? "text-green-600" : completeness >= 50 ? "text-yellow-600" : "text-orange-600"}>
                          {completeness >= 80 ? "Great" : completeness >= 50 ? "Good" : "Getting Started"}
                        </span>
                      </div>
                      <Progress value={completeness} />
                      <ul className="mt-3 text-xs space-y-1 text-muted-foreground">
                        <li>• Add a detailed bio</li>
                        <li>• Choose at least 3 traits</li>
                        <li>• Upload a profile photo</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                  <CardHeader>
                    <CardTitle className="text-xl">Preferences</CardTitle>
                    <CardDescription>Let others know your travel style</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Budget</Label>
                      <Input id="budget" placeholder="e.g., ₹50-₹100/day" />
                    </div>
                    <div>
                      <Label htmlFor="pace">Pace</Label>
                      <Input id="pace" placeholder="Relaxed, Moderate, Fast" />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="interests">Interests</Label>
                      <Input id="interests" placeholder="Food, Museums, Hiking" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                  <CardHeader>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                    <CardDescription>Keep your profile fresh</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => (window.location.href = "/profile-setup")}>Edit Profile</Button>
                    <Button variant="outline">Share Profile</Button>
                    <Button variant="ghost" onClick={() => (window.location.href = "/matches")}>View Matches</Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
