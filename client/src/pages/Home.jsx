import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { ImageWithFallback } from '../components/ImageWithFallback.jsx';
import { ArrowRight, Leaf, Users, TrendingUp, Shield, Star, User, Tractor } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useEffect } from 'react';
import MagicBento from '../components/MagicBento.jsx';
import MagicCard from '../components/MagicCard.jsx';
import BlurText from '../components/ui/blur-text.jsx';

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their respective dashboards
  useEffect(() => {
    if (!loading && user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'farmer':
          navigate('/farmer/dashboard', { replace: true });
          break;
        case 'buyer':
          navigate('/buyer/dashboard', { replace: true });
          break;
        default:
          // Do nothing for unknown roles
          break;
      }
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only show landing page for non-authenticated users
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
    <MagicBento className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-magical transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="float-animation">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-800 via-green-700 to-teal-600 bg-clip-text text-transparent animate-fade-in-up">
                Ready to Transform Your Agricultural Business? ✨
              </h1>
              <p className="text-xl mb-8 leading-relaxed text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Join thousands of farmers and buyers who are already benefiting from direct, transparent trading with magical efficiency
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/sign-up?type=farmer">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-xl px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 glow-pulse">
                    <Tractor className="w-5 h-5" />
                    Start as Farmer
                  </Button>
                </Link>
                <Link to="/auth/sign-up?type=buyer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-xl px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
                    <User className="w-5 h-5" />
                    Start as Buyer
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <MagicCard className="overflow-hidden" glowIntensity="high">
                <ImageWithFallback
                  src="https://kerone.com/blog/wp-content/uploads/2021/05/Drying-in-Agricultural.jpg"
                  alt="Fresh vegetables and crops"
                  className="w-full h-[500px] object-cover"
                />
              </MagicCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              Why Choose HarvestHub? 🌟
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
              Our platform provides everything you need for successful agricultural trading with magical precision
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MagicCard key={index} glowIntensity="medium" className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center mb-4 shadow-lg transition-colors duration-300">
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-400 transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{feature.description}</p>
                </MagicCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-emerald-900/20 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              How It Works ⚡
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 transition-colors duration-300">
              Simple steps to start magical trading
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <MagicCard className="text-center p-8" glowIntensity="high">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg glow-pulse">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 transition-colors duration-300">Register & Verify</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Sign up as a farmer or buyer and complete AGMARK verification for quality assurance
              </p>
            </MagicCard>

            <MagicCard className="text-center p-8" glowIntensity="high">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg glow-pulse">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 transition-colors duration-300">List or Browse</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Farmers list their crops while buyers browse and post requirements with smart filtering
              </p>
            </MagicCard>

            <MagicCard className="text-center p-8" glowIntensity="high">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg glow-pulse">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 transition-colors duration-300">Trade & Track</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Connect, negotiate, complete secure payments and track orders in real-time
              </p>
            </MagicCard>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              Trusted by Thousands 💫
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
              See what our magical community says about HarvestHub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <MagicCard key={index} glowIntensity="medium" className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">{testimonial.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">{testimonial.role}</p>
                <p className="italic text-gray-700 dark:text-gray-300 transition-colors duration-300">"{testimonial.comment}"</p>
              </MagicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-br from-gray-900 to-emerald-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                  <div className="w-6 h-6 bg-white rounded text-center flex items-center justify-center">
                    🌾
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">HarvestHub</h3>
              </div>
              <p className="text-gray-300">
                Connecting agriculture, empowering communities, building sustainable futures with magical innovation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-green-400 transition-colors">For Farmers</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">For Buyers</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">AGMARK Certification</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-green-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HarvestHub. All rights reserved. Made with 🌱 and ✨ for farmers.</p>
          </div>
        </div>
      </footer>
    </MagicBento>
  );
}


