import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plane, Upload, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    age: "",
    gender: "",
    location: "",
    bio: "",
    profilePicture: null as File | null,

    // Personality
    personality: {
      introvertExtrovert: "",
      adventurousRelaxed: "",
      plannerSpontaneous: "",
      budgetLuxury: ""
    },
    
    // Interests & Preferences
    interests: [] as string[],
    dislikes: [] as string[],
    
    // Travel Preferences
    travelStyle: "",
    destinationType: "",
    preferredDestinations: "",
    tripDuration: "",
    budgetRange: "",
    groupSize: "",

    // Step 5: Contact & Verification
    mobileNumber: "",
    aadhaarNumber: "",

    // Step 6: Local Guide
    isLocalGuide: false,
    guideExpertise: "",
    guideLanguages: "",
    guideTourTypes: [] as string[],
    guideAvailability: "",
    guideCertifications: "",

  });

  const interestOptions = [
    "Adventure Sports", "Art & Museums", "Beaches", "City Exploration", "Cultural Sites",
    "Food & Dining", "Hiking", "History", "Music & Festivals", "Nature", "Nightlife",
    "Photography", "Shopping", "Wildlife", "Wellness & Spa"
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [category, subfield] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...prev[category as keyof typeof prev.personality],
          [subfield]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleInterestToggle = (interest: string, type: 'interests' | 'dislikes') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(interest)
        ? prev[type].filter(item => item !== interest)
        : [...prev[type], interest]
    }));
  };

  const handleNext = () => {
    if (currentStep === 5) {
      const mobileValid = formData.mobileNumber.replace(/\D/g, '').length === 10;
      const aadhaarValid = formData.aadhaarNumber.replace(/\D/g, '').length === 12;
      if (!mobileValid || !aadhaarValid) {
        return;
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        localStorage.setItem('tb_profile', JSON.stringify(formData));
      } catch {}
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate('/dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          </Button>
        </div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl text-foreground">TravelBuddy</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">Help us find your perfect travel companions</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-2 border-blue-100 shadow-lg">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Upload profile picture</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State/Country"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your travel style, and what you're looking for in a travel buddy..."
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Personality Traits */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Personality Traits</CardTitle>
                <CardDescription>Help us understand your travel personality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Social Energy</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button
                        variant={formData.personality.introvertExtrovert === 'introvert' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('personality.introvertExtrovert', 'introvert')}
                        className="h-auto p-4 flex-col"
                      >
                        <div className="font-medium">Introvert</div>
                        <div className="text-xs opacity-70">Prefer quieter, more intimate experiences</div>
                      </Button>
                      <Button
                        variant={formData.personality.introvertExtrovert === 'extrovert' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('personality.introvertExtrovert', 'extrovert')}
                        className="h-auto p-4 flex-col"
                      >
                        <div className="font-medium">Extrovert</div>
                        <div className="text-xs opacity-70">Love meeting new people and social activities</div>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Adventure Level</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button
                        variant={formData.personality.adventurousRelaxed === 'adventurous' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('personality.adventurousRelaxed', 'adventurous')}
                        className="h-auto p-4 flex-col"
                      >
                        <div className="font-medium">Adventurous</div>
                        <div className="text-xs opacity-70">Seek thrills and new experiences</div>
                      </Button>
                      <Button
                        variant={formData.personality.adventurousRelaxed === 'relaxed' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('personality.adventurousRelaxed', 'relaxed')}
                        className="h-auto p-4 flex-col"
                      >
                        <div className="font-medium">Relaxed</div>
                        <div className="text-xs opacity-70">Prefer leisurely, peaceful trips</div>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Planning Style</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button
                        variant={formData.personality.plannerSpontaneous === 'planner' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('personality.plannerSpontaneous', 'planner')}
                        className="h-auto p-4 flex-col"
                      >
                        <div className="font-medium">Planner</div>
                        <div className="text-xs opacity-70">Like detailed itineraries</div>
                      </Button>
                      <Button
                        variant={formData.personality.plannerSpontaneous === 'spontaneous' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('personality.plannerSpontaneous', 'spontaneous')}
                        className="h-auto p-4 flex-col"
                      >
                        <div className="font-medium">Spontaneous</div>
                        <div className="text-xs opacity-70">Go with the flow</div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Interests & Preferences */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Interests & Preferences</CardTitle>
                <CardDescription>What do you love and what do you avoid?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">What interests you? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {interestOptions.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer justify-center p-2 h-auto"
                        onClick={() => handleInterestToggle(interest, 'interests')}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">What would you prefer to avoid?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {interestOptions.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.dislikes.includes(interest) ? "destructive" : "outline"}
                        className="cursor-pointer justify-center p-2 h-auto"
                        onClick={() => handleInterestToggle(interest, 'dislikes')}
                      >
                        {formData.dislikes.includes(interest) && <X className="h-3 w-3 mr-1" />}
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Travel Preferences */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle>Travel Preferences</CardTitle>
                <CardDescription>Tell us about your ideal travel style</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="travelStyle">Travel Style</Label>
                    <Select value={formData.travelStyle} onValueChange={(value) => handleInputChange('travelStyle', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="backpacking">Backpacking</SelectItem>
                        <SelectItem value="mid-range">Mid-range</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destinationType">Destination Type</Label>
                    <Select value={formData.destinationType} onValueChange={(value) => handleInputChange('destinationType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Domestic or International" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupSize">Preferred Group Size</Label>
                    <Select value={formData.groupSize} onValueChange={(value) => handleInputChange('groupSize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Just me (1 person)</SelectItem>
                        <SelectItem value="pair">Pair (2 people)</SelectItem>
                        <SelectItem value="small">Small group (3-5)</SelectItem>
                        <SelectItem value="large">Large group (6+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tripDuration">Preferred Trip Duration</Label>
                    <Select value={formData.tripDuration} onValueChange={(value) => handleInputChange('tripDuration', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekend">Weekend (2-3 days)</SelectItem>
                        <SelectItem value="week">1 week</SelectItem>
                        <SelectItem value="two-weeks">2 weeks</SelectItem>
                        <SelectItem value="month">1 month</SelectItem>
                        <SelectItem value="longer">Longer than 1 month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetRange">Budget Range (per person)</Label>
                    <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                        <SelectItem value="1000-2000">₹1,000 - ₹2,000</SelectItem>
                        <SelectItem value="2000-3000">₹2,000 - ₹3,000</SelectItem>
                        <SelectItem value="3000-5000">₹3,000 - ₹5,000</SelectItem>
                        <SelectItem value="5000+">₹5,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDestinations">Dream Destinations</Label>
                  <Textarea
                    id="preferredDestinations"
                    placeholder="List some places you'd love to visit..."
                    rows={3}
                    value={formData.preferredDestinations}
                    onChange={(e) => handleInputChange('preferredDestinations', e.target.value)}
                  />
                </div>
              </CardContent>
            </>
          )}



          {/* Step 5: Mobile & Aadhaar (Required) */}
          {currentStep === 5 && (
            <>
              <CardHeader>
                <CardTitle>Contact & Verification</CardTitle>
                <CardDescription>Provide your mobile and Aadhaar (both required)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleInputChange('mobileNumber', digits);
                    }}
                  />
                  {formData.mobileNumber.replace(/\D/g, '').length !== 10 && (
                    <p className="text-xs text-red-600">Enter exactly 10 digits.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    inputMode="numeric"
                    placeholder="XXXX-XXXX-XXXX"
                    value={formData.aadhaarNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const parts = [digits.slice(0,4), digits.slice(4,8), digits.slice(8,12)].filter(Boolean);
                      const formatted = parts.join('-');
                      handleInputChange('aadhaarNumber', formatted);
                    }}
                  />
                  {formData.aadhaarNumber.replace(/\D/g, '').length !== 12 && (
                    <p className="text-xs text-red-600">Enter 12 digits in 4-4-4 format.</p>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 6: Local Travel Guide Option */}
          {currentStep === 6 && (
            <>
              <CardHeader>
                <CardTitle>Local Travel Guide Option</CardTitle>
                <CardDescription>Interested in becoming a local guide?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <Label htmlFor="isGuide">Interested in guiding?</Label>
                  <Button id="isGuide" variant={formData.isLocalGuide ? 'default' : 'outline'} onClick={() => setFormData(prev => ({...prev, isLocalGuide: !prev.isLocalGuide}))}>
                    {formData.isLocalGuide ? 'Yes' : 'No'}
                  </Button>
                </div>

                {formData.isLocalGuide && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="guideExpertise">Area of expertise / locality coverage</Label>
                      <Input id="guideExpertise" value={formData.guideExpertise} onChange={(e) => handleInputChange('guideExpertise', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guideLanguages">Languages spoken</Label>
                      <Input id="guideLanguages" value={formData.guideLanguages} onChange={(e) => handleInputChange('guideLanguages', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="mb-2 block">Preferred types of tours</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Cultural','Adventure','Sightseeing','Food & Culinary','Nature & Wildlife','History','Photography'].map((t) => (
                          <Button key={t} variant={formData.guideTourTypes.includes(t) ? 'default' : 'outline'} size="sm" onClick={() => setFormData(prev => ({...prev, guideTourTypes: prev.guideTourTypes.includes(t) ? prev.guideTourTypes.filter(x=>x!==t) : [...prev.guideTourTypes, t]}))}>
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guideAvailability">Availability schedule</Label>
                      <Input id="guideAvailability" value={formData.guideAvailability} onChange={(e) => handleInputChange('guideAvailability', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guideCertifications">Certifications or prior experience</Label>
                      <Input id="guideCertifications" value={formData.guideCertifications} onChange={(e) => handleInputChange('guideCertifications', e.target.value)} />
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between p-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === totalSteps ? 'Complete Profile' : 'Next'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
