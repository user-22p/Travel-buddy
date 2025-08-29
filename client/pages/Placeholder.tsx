import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, ArrowLeft, Construction } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Placeholder() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const pageName = location.pathname.split('/').pop() || 'page';
  const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('-', ' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground">TravelBuddy</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Home
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md text-center border-2 border-orange-100">
          <CardHeader>
            <Construction className="h-16 w-16 text-accent mx-auto mb-4" />
            <CardTitle className="text-2xl text-foreground">
              {formattedPageName} Coming Soon
            </CardTitle>
            <CardDescription>
              This feature is currently under development. We're working hard to bring you an amazing {formattedPageName.toLowerCase()} experience!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Want to see this page implemented? Let us know what features you'd like to see here.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
