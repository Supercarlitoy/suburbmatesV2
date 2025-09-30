"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, MapPin, Award, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { glass, useStandardAnimations } from "@/lib/design-system";
import { StatusBadge } from "@/components/ui/StatusBadge";


export default function AboutPage() {
  const { fadeInUp } = useStandardAnimations();
  const stats = [
    { number: "500+", label: "Melbourne Businesses", icon: Users },
    { number: "50+", label: "Suburbs Covered", icon: MapPin },
    { number: "10,000+", label: "Connections Made", icon: CheckCircle },
    { number: "98%", label: "Customer Satisfaction", icon: Award },
  ];

  const features = [
    {
      icon: Shield,
      title: "ABN Verified Businesses",
      description: "Every business is verified through official ABR integration, ensuring trust and authenticity."
    },
    {
      icon: MapPin,
      title: "Melbourne Focused",
      description: "Exclusively serving Melbourne's suburbs, connecting local businesses with their communities."
    },
    {
      icon: Zap,
      title: "Instant Connections",
      description: "Direct communication between residents and businesses without middleman interference."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Building stronger local communities through verified business relationships."
    }
  ];

  return (
    <div className={`min-h-screen ${glass.heroBg}`}>
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-centre">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <StatusBadge variant="blue" size="md" className="mb-6">
              About SuburbMates
            </StatusBadge>
            <h1 className="text-5xl lg:text-6xl font-black mb-6">
              <span className="block text-gray-900">Connecting</span>
              <span className={`${glass.gradientText} block`}>Melbourne's Communities</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              SuburbMates is Melbourne's premier local business network, dedicated to strengthening 
              community connections through verified, trusted business relationships.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-centre"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full grid place-items-centre mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe in the power of local communities. SuburbMates was created to bridge 
                the gap between Melbourne residents and the exceptional businesses in their neighborhoods.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Through our ABN verification system and community-focused approach, we ensure 
                every connection is built on trust, quality, and local pride.
              </p>
              <div className="flex flex-wrap gap-3">
                <StatusBadge variant="green" size="sm">✓ ABR Integrated</StatusBadge>
                <StatusBadge variant="blue" size="sm">✓ Melbourne Focused</StatusBadge>
                <StatusBadge variant="purple" size="sm">✓ Community Driven</StatusBadge>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl grid place-items-centre">
                <div className="text-8xl">🏘️</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-centre mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SuburbMates?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re more than just a directory – we&apos;re a community platform built for Melbourne&apos;s unique neighborhoods.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="text-centre pb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full grid place-items-centre mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-centre leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-centre">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-primary to-accent text-white border-0">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Join Melbourne&apos;s Premier Business Network?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Connect with your local community and grow your business today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Join as Business Owner
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Browse Local Businesses
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}