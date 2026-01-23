"use client";

import React from "react";
import { Header } from "@/components/LandingPage/layout/header";
import { Footer } from "@/components/LandingPage/layout/footer";
import { SectionHeader } from "@/components/LandingPage/layout/section-header";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for form submission
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <section className="pt-20 pb-16 md:pt-32 md:pb-24 bg-muted relative overflow-hidden">
          <div className="container-padding relative z-10 text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
              Contact Us
            </span>
            <h1 className="text-responsive-3xl font-bold mb-6">
              We're Here to <span className="text-gradient">Help You</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about CHWK? Whether you're a business owner or a customer,
              our team is ready to assist you. Reach out to us through any of the channels below.
            </p>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </section>

        <section className="section-spacing bg-white">
          <div className="container-padding">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">Email Us</h4>
                        <p className="text-muted-foreground text-sm">Our friendly team is here to help.</p>
                        <a href="mailto:support@chwk.com" className="text-primary font-medium hover:underline">support@chwk.com</a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-bold">Chat to sales</h4>
                        <p className="text-muted-foreground text-sm">Speak to our business onboarding team.</p>
                        <a href="mailto:sales@chwk.com" className="text-primary font-medium hover:underline">sales@chwk.com</a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-bold">Call us</h4>
                        <p className="text-muted-foreground text-sm">Mon-Fri from 9am to 6pm IST.</p>
                        <a href="tel:+919818618448" className="text-primary font-medium hover:underline">+91 9818618448</a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h4 className="font-bold">Office</h4>
                        <p className="text-muted-foreground text-sm">Visit our headquarters.</p>
                        <p className="font-medium">New Delhi, India</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted rounded-2xl border border-border">
                  <div className="flex gap-3 items-center mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h4 className="font-bold">Business Hours</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex justify-between"><span>Monday - Friday:</span> <span className="text-foreground font-medium">9 AM - 6 PM</span></li>
                    <li className="flex justify-between"><span>Saturday:</span> <span className="text-foreground font-medium">10 AM - 2 PM</span></li>
                    <li className="flex justify-between"><span>Sunday:</span> <span className="text-foreground font-medium">Closed</span></li>
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="glass p-8 md:p-12 rounded-[2rem] border border-white/20 shadow-xl">
                  <h3 className="text-2xl font-bold mb-8">Send us a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">First Name</label>
                        <Input placeholder="John" className="bg-white/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name</label>
                        <Input placeholder="Doe" className="bg-white/50" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <Input type="email" placeholder="john@example.com" className="bg-white/50" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input placeholder="How can we help?" className="bg-white/50" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <Textarea placeholder="Tell us more about your inquiry..." className="min-h-[150px] bg-white/50" />
                    </div>

                    <Button type="submit" className="w-full py-6 text-lg font-bold gap-2 btn-shine shadow-xl shadow-primary/20">
                      <Send className="w-5 h-5" /> Send Message
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By submitting this form, you agree to our <a href="/privacy" className="underline">Privacy Policy</a> and <a href="/terms" className="underline">Terms of Service</a>.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="section-spacing bg-muted">
          <div className="container-padding">
            <SectionHeader
              title="Frequently Asked Questions"
              subtitle="Quick answers to common questions"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  q: "How do I list my business on CHWK?",
                  a: "You can click on 'For Businesses' in the header or visit /business/signup to start the 5-minute onboarding process."
                },
                {
                  q: "Is CHWK a free service for customers?",
                  a: "Yes, CHWK is completely free for customers to search, discover, and connect with local businesses."
                },
                {
                  q: "How are businesses verified on the platform?",
                  a: "We use a multi-step verification process including GST/Business ID validation and manual community checks."
                },
                {
                  q: "Can I review a business without an account?",
                  a: "To ensure authenticity and prevent spam, we require users to sign in through Clerk before posting a review."
                }
              ].map((faq, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-border shadow-sm card-hover">
                  <h4 className="font-bold mb-3">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" className="rounded-full">View All FAQs</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
