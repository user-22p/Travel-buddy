import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Heart, Shield, Star, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AIAssistantButton from "@/components/assistant/AIAssistantButton";
import SOSButton from "@/components/sos/SOSButton";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description: "Find travel buddies with shared interests and compatible personalities"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Verified profiles and secure messaging for peace of mind"
    },
    {
      icon: MapPin,
      title: "Global Destinations",
      description: "Discover travelers heading to your dream destinations"
    },
    {
      icon: Heart,
      title: "Compatibility Scores",
      description: "AI-powered matching based on preferences and travel styles"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      location: "Backpacked through Thailand",
      text: "Found the perfect travel buddy for my solo trip to Thailand. We had amazing adventures!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      location: "European Adventure",
      text: "Met my travel companion on TravelBuddy. 3 weeks across Europe - unforgettable experience!",
      rating: 5
    },
    {
      name: "Emma Thompson",
      location: "Japan Cultural Tour",
      text: "Connected with someone who shared my love for Japanese culture. Best trip ever!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground">TravelBuddy</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            🌟 Find Your Perfect Travel Companion
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Next Adventure
            <span className="text-primary block">Starts Here</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with like-minded travelers, explore the world together, and create unforgettable memories. 
            TravelBuddy matches you with compatible travel partners based on your interests, personality, and travel style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/signup')}>
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate('/browse')}>
              Browse Travelers
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Active Travelers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose TravelBuddy?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make it easy and safe to find your perfect travel companion
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground">
              Real adventures from real travelers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {testimonial.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Find Your Travel Buddy?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who've found their perfect companions
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={() => navigate('/signup')}>
            Join TravelBuddy Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plane className="h-6 w-6" />
                <span className="font-bold text-lg">TravelBuddy</span>
              </div>
              <p className="text-gray-300">
                Connecting travelers worldwide for unforgettable adventures.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li>About Us</li>
                <li>How It Works</li>
                <li>Safety</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community Guidelines</li>
                <li>Trust & Safety</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 TravelBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <SOSButton />
      <AIAssistantButton />
    </div>
  );
}
