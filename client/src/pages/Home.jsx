import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { ImageWithFallback } from '../components/ImageWithFallback.jsx';
import { ArrowRight, Leaf, Users, TrendingUp, Shield, Star } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Direct Connection",
      description: "Connect farmers directly with buyers, eliminating middlemen and increasing profits for all."
    },
    {
      icon: Shield,
      title: "AGMARK Certified",
      description: "All crops are quality certified with AGMARK grading system for transparency and trust."
    },
    {
      icon: TrendingUp,
      title: "Market Analytics",
      description: "Access real-time market data, price trends, and demand forecasting tools."
    },
    {
      icon: Leaf,
      title: "Sustainable Trading",
      description: "Promote sustainable farming practices and eco-friendly agricultural solutions."
    }
  ];

  const testimonials = [
    {
      name: "Jeet Gandhi",
      role: "Farmer",
      rating: 5,
      comment: "HarvestHub helped me get 30% better prices for my wheat harvest. Direct connection with buyers is amazing!"
    },
    {
      name: "Jatin Vora",
      role: "Agricultural Buyer",
      rating: 5,
      comment: "Quality assured crops with AGMARK certification. The platform makes sourcing so much easier."
    },
    {
      name: "Heet Mistry",
      role: "Agricultural Cooperative",
      rating: 5,
      comment: "Perfect platform for managing our member farmers' produce and connecting with reliable buyers."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-black">
                Ready to Transform Your Agricultural Business?
              </h1>
              <p className="text-xl mb-8 leading-relaxed text-black">
                Join thousands of farmers and buyers who are already benefiting from direct, transparent trading
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-green-600 text-black font-semibold text-xl px-6 py-2">
                  Start as Farmer
                </Button>
                <Button size="lg" className="bg-blue-600 text-black font-semibold text-xl px-6 py-2">
                  Start as Buyer
                </Button>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://kerone.com/blog/wp-content/uploads/2021/05/Drying-in-Agricultural.jpg"
                alt="Fresh vegetables and crops"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose HarvestHub?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides everything you need for successful agricultural trading
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-black">
              How It Works
            </h2>
            <p className="text-xl text-black">
              Simple steps to start trading
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-black">Register & Verify</h3>
              <p className="text-black">
                Sign up as a farmer or buyer and complete AGMARK verification for quality assurance
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-black">List or Browse</h3>
              <p className="text-black">
                Farmers list their crops while buyers browse and post requirements with smart filtering
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-black">Trade & Track</h3>
              <p className="text-black">
                Connect, negotiate, complete secure payments and track orders in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community says about HarvestHub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-primary">
                  <div className="w-6 h-6 bg-white rounded text-center flex items-center justify-center">
                    🌾
                  </div>
                </div>
                <h3 className="text-xl font-bold">HarvestHub</h3>
              </div>
              <p className="text-muted-foreground">
                Connecting agriculture, empowering communities, building sustainable futures.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">For Farmers</a></li>
                <li><a href="#" className="hover:text-foreground">For Buyers</a></li>
                <li><a href="#" className="hover:text-foreground">AGMARK Certification</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 HarvestHub. All rights reserved. Made with 🌱 for farmers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


