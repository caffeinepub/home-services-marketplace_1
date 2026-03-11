import { Badge } from "@/components/ui/badge";
import { Clock, Mail, MapPin, Phone, Shield, Wrench } from "lucide-react";
import { motion } from "motion/react";

const faqs = [
  {
    q: "How do I book a repair service?",
    a: "Sign in with Internet Identity, go to Browse Services, pick a service and choose a date and time slot. That's it!",
  },
  {
    q: "How are technicians verified?",
    a: "All technicians submit their profile and specialization. Our admin team reviews and approves each technician before they can accept jobs.",
  },
  {
    q: "What areas do you serve?",
    a: "We currently serve customers across major cities. Use the Nearby Technicians map in your dashboard to find professionals close to you.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. Open your Customer Dashboard, find the booking, and click Cancel before the technician starts the job.",
  },
  {
    q: "How does payment work?",
    a: "Payment is settled directly with the technician after the job is completed. Pricing is shown upfront when you book.",
  },
  {
    q: "I want to join as a technician — how?",
    a: "Sign in with Internet Identity, go to Register, choose 'I'm a Technician', fill in your details and submit. Your application will be reviewed by the admin.",
  },
];

const hours = [
  { day: "Monday – Friday", time: "9:00 AM – 8:00 PM" },
  { day: "Saturday", time: "10:00 AM – 6:00 PM" },
  { day: "Sunday", time: "Closed" },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-black text-foreground mb-4">
              About Lepzo
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Lepzo connects customers with certified IT technicians for laptop
              repair, desktop fixes, accessories, and network setup — all booked
              online in minutes.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* What We Do */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Wrench className="w-6 h-6 text-primary" />,
              title: "Expert Repairs",
              desc: "Certified technicians for laptop, desktop, and accessories — at your doorstep.",
            },
            {
              icon: <Shield className="w-6 h-6 text-primary" />,
              title: "Verified Professionals",
              desc: "Every technician is reviewed and approved by our admin team before taking jobs.",
            },
            {
              icon: <Clock className="w-6 h-6 text-primary" />,
              title: "Flexible Scheduling",
              desc: "Book morning, afternoon, or evening slots that fit your schedule.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Contact + Hours */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* Contact */}
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <h2 className="font-display font-bold text-2xl text-foreground">
              Contact Us
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Phone / WhatsApp
                  </p>
                  <p className="text-sm text-muted-foreground">
                    +91 98765 43210
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">
                    support@lepzo.in
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Service Area
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Major cities across India. Use the map to find your nearest
                    technician.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <h2 className="font-display font-bold text-2xl text-foreground">
              Business Hours
            </h2>
            <div className="space-y-3">
              {hours.map((h) => (
                <div
                  key={h.day}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm font-medium text-foreground">
                    {h.day}
                  </span>
                  <Badge
                    variant={h.time === "Closed" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {h.time}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Emergency repairs may be available outside business hours — call
              us to check availability.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 space-y-2"
                data-ocid={`about.faq.item.${i + 1}`}
              >
                <p className="text-sm font-bold text-foreground">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
