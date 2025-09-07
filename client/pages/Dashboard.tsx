import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Search, Heart, MessageCircle, MapPin, Calendar, IndianRupee, User, Settings, LogOut, Filter, ListTodo, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BottomNav from "@/components/navigation/BottomNav";
import AIAssistantButton from "@/components/assistant/AIAssistantButton";
import SOSButton from "@/components/sos/SOSButton";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");

  // Mock data for travel buddies
  const travelBuddies = [
    {
      id: 1,
      name: "Aarav Sharma",
      age: 27,
      location: "Delhi, India",
      destination: "Ladakh, India",
      dates: "July 10-20, 2024",
      budget: "₹15000-25000",
      compatibility: 93,
      bio: "Planning a Leh–Ladakh road trip: monasteries, Pangong Tso and night skies. Looking for a fellow road-tripper.",
      interests: ["Road Trips", "Photography", "Mountains", "Culture"],
      avatar: "/api/placeholder/64/64",
      isOnline: true
    },
    {
      id: 2,
      name: "Priya Nair",
      age: 25,
      location: "Bengaluru, India",
      destination: "Goa, India",
      dates: "August 5-9, 2024",
      budget: "₹8000-12000",
      compatibility: 88,
      bio: "Beach lover planning cafés, shacks and a beginner scuba session in North Goa.",
      interests: ["Beaches", "Food", "Nightlife", "Adventure"],
      avatar: "/api/placeholder/64/64",
      isOnline: false
    },
    {
      id: 3,
      name: "Rohan Mehta",
      age: 30,
      location: "Mumbai, India",
      destination: "Jaipur, India",
      dates: "September 12-18, 2024",
      budget: "₹10000-18000",
      compatibility: 91,
      bio: "Heritage walks through Amer Fort and City Palace, plus local markets and kachori trail.",
      interests: ["History", "Culture", "Photography", "Food"],
      avatar: "/api/placeholder/64/64",
      isOnline: true
    },
    {
      id: 4,
      name: "Neha Iyer",
      age: 28,
      location: "Chennai, India",
      destination: "Munnar, Kerala",
      dates: "October 1-7, 2024",
      budget: "₹9000-15000",
      compatibility: 89,
      bio: "Tea estates, easy treks and waterfalls in the Western Ghats. Looking for a nature-loving buddy.",
      interests: ["Trekking", "Nature", "Tea Trails", "Photography"],
      avatar: "/api/placeholder/64/64",
      isOnline: true
    }
  ];

  const filteredBuddies = travelBuddies.filter(buddy => {
    const matchesSearch = buddy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         buddy.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDestination = destinationFilter === "all" || !destinationFilter || buddy.destination.includes(destinationFilter);
    const matchesBudget = budgetFilter === "all" || !budgetFilter || buddy.budget.includes(budgetFilter);

    return matchesSearch && matchesDestination && matchesBudget;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground">TravelBuddy</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/planner')}>
                <ListTodo className="h-4 w-4 mr-2" />
                Planner
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/expenses')}>
                <Wallet className="h-4 w-4 mr-2" />
                Expenses
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Travel Buddy</h1>
          <p className="text-muted-foreground">Discover compatible travelers for your next adventure</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  <SelectItem value="Goa">Goa</SelectItem>
                  <SelectItem value="Ladakh">Ladakh</SelectItem>
                  <SelectItem value="Jaipur">Jaipur</SelectItem>
                  <SelectItem value="Munnar">Munnar</SelectItem>
                </SelectContent>
              </Select>
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="1000">₹1000-2000</SelectItem>
                  <SelectItem value="2000">₹2000-3000</SelectItem>
                  <SelectItem value="3000">₹3000+</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Travel Buddies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuddies.map((buddy) => (
            <Card key={buddy.id} className="hover:shadow-lg transition-all duration-300 border-blue-100">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={buddy.avatar} alt={buddy.name} />
                        <AvatarFallback>{buddy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {buddy.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{buddy.name}, {buddy.age}</CardTitle>
                      <CardDescription className="text-sm">{buddy.location}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {buddy.compatibility}% match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{buddy.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{buddy.dates}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4" />
                    <span>{buddy.budget}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">{buddy.bio}</p>
                
                <div className="flex flex-wrap gap-1">
                  {buddy.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {buddy.interests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{buddy.interests.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBuddies.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No travel buddies found</CardTitle>
              <CardDescription>
                Try adjusting your search criteria or check back later for new travelers.
              </CardDescription>
              <Button className="mt-4" onClick={() => {
                setSearchQuery("");
                setDestinationFilter("all");
                setBudgetFilter("all");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <SOSButton />
      <AIAssistantButton />
      <BottomNav />
    </div>
  );
}
