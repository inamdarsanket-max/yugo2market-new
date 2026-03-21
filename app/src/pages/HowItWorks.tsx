import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  FileText, 
  Handshake, 
  TrendingUp, 
  Shield, 
  CreditCard,
  Users,
  ArrowRight,
  CheckCircle,
  Zap,
  Star
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover Creators',
    description: 'Browse our marketplace of verified local creators. Filter by niche, location, audience size, and engagement rates to find your perfect match.',
    features: [
      'Advanced search and filtering',
      'Detailed creator profiles',
      'Audience demographics',
      'Past campaign performance'
    ]
  },
  {
    icon: FileText,
    title: 'Create Your Campaign',
    description: 'Set up your campaign with clear objectives, budget, and deliverables. Our platform guides you through creating compelling campaign briefs.',
    features: [
      'Campaign templates',
      'Milestone-based payments',
      'Clear deliverable definitions',
      'Timeline management'
    ]
  },
  {
    icon: Handshake,
    title: 'Collaborate & Approve',
    description: 'Work directly with creators through our platform. Review content, provide feedback, and approve posts before they go live.',
    features: [
      'In-app messaging',
      'Content review system',
      'Revision requests',
      'Approval workflow'
    ]
  },
  {
    icon: TrendingUp,
    title: 'Track & Optimize',
    description: 'Monitor campaign performance in real-time with detailed analytics. Track reach, engagement, clicks, and conversions.',
    features: [
      'Real-time analytics',
      'ROI tracking',
      'Engagement metrics',
      'Conversion tracking'
    ]
  }
];

const benefits = [
  {
    icon: Shield,
    title: 'Secure Escrow Payments',
    description: 'Your funds are held securely until deliverables are met. Pay only for completed work.'
  },
  {
    icon: Users,
    title: 'Verified Creators',
    description: 'All creators are vetted and verified. Check ratings and reviews from other brands.'
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment Options',
    description: 'Pay via UPI, cards, net banking, or wallet. Multiple payment methods supported.'
  }
];

const faqs = [
  {
    question: 'How do I find the right creator?',
    answer: 'Use our advanced search filters to find creators by location, niche, audience size, and engagement rate. Review their profiles, past work, and ratings to make an informed decision.'
  },
  {
    question: 'How does payment work?',
    answer: 'We use milestone-based payments. You pay into escrow, and funds are released to the creator only when deliverables are completed and approved by you.'
  },
  {
    question: 'What if I\'m not satisfied with the content?',
    answer: 'You can request revisions based on your campaign brief. If issues persist, our support team is available to help mediate and resolve disputes.'
  },
  {
    question: 'How long does a typical campaign take?',
    answer: 'Campaign duration varies based on scope. A single post might take 3-7 days, while comprehensive campaigns can span several weeks. Timelines are agreed upon upfront.'
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Zap className="w-4 h-4 text-creator-pink" />
            <span className="text-sm text-white/80">How It Works</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8">
            Influencer Marketing <span className="gradient-text">Made Simple</span>
          </h1>
          <p className="text-xl text-white/50 max-w-3xl mx-auto mb-12">
            From discovery to campaign completion, our platform streamlines every step of your influencer marketing journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gradient-bg-animated text-white rounded-full px-10 py-6 text-lg font-semibold btn-glow">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-10 py-6 text-lg font-semibold">
                Browse Creators
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Star className="w-4 h-4 text-creator-purple" />
              <span className="text-sm text-white/80">The Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Your Journey in <span className="gradient-text">4 Simple Steps</span>
            </h2>
          </div>

          <div className="space-y-20">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-8xl font-black text-white/[0.03] mb-4">0{index + 1}</div>
                    <h3 className="text-3xl md:text-4xl font-black text-white mb-4">{step.title}</h3>
                    <p className="text-white/50 text-lg mb-6 leading-relaxed">{step.description}</p>
                    <ul className="space-y-3">
                      {step.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-center gap-3 text-white/60">
                          <CheckCircle className="w-5 h-5 text-creator-pink" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <div className="aspect-square rounded-3xl glass-card flex items-center justify-center">
                      <Icon className="w-40 h-40 text-white/10" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-creator-purple/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Shield className="w-4 h-4 text-creator-blue" />
              <span className="text-sm text-white/80">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Built for <span className="gradient-text">Success</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="glass-card border-white/[0.06] rounded-3xl card-glow">
                  <CardContent className="p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                    <p className="text-white/50 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <FileText className="w-4 h-4 text-creator-pink" />
              <span className="text-sm text-white/80">FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <Card key={index} className="glass-card border-white/[0.06] rounded-3xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
                  <p className="text-white/50 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] gradient-bg-animated p-16 text-center">
            <div className="absolute inset-0 glow-gradient opacity-50" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                Ready to Start Your<br />First Campaign?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of brands already using Yugo2Market to grow their business with influencer marketing.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-white text-creator-pink hover:bg-white/90 rounded-full px-10 py-6 text-lg font-semibold btn-glow">
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
