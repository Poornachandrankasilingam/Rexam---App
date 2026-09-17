import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12 w-full">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Customer Support & Assistance</span>
          </div>
          <h1 className="text-4xl font-extrabold font-outfit text-white">Get in Touch with Rexam AI</h1>
          <p className="text-slate-300 text-sm">Have questions regarding examinations, institutional licenses, or AI proctoring? We are here to help.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-3xl border border-white/10 flex items-start space-x-4 shadow-lg">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Email Support</h3>
                <p className="text-xs text-slate-400 mt-1">support@rexam.ai</p>
                <p className="text-xs text-slate-400">admin@rexam.ai</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 flex items-start space-x-4 shadow-lg">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Helpline Support</h3>
                <p className="text-xs text-slate-400 mt-1">+91 1800-REXAM-AI</p>
                <p className="text-xs text-slate-400">Mon - Sat (9:00 AM - 7:00 PM IST)</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 flex items-start space-x-4 shadow-lg">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Headquarters</h3>
                <p className="text-xs text-slate-400 mt-1">Rexam AI Examination Infrastructure</p>
                <p className="text-xs text-slate-400">Chennai & Bangalore, India</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white font-outfit">Send Us a Direct Message</h2>

            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in">
                <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Message Received!</h3>
                <p className="text-xs text-slate-300">Thank you for reaching out. Our support team will get back to you within 24 hours.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-xl text-xs mt-2">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Institutional Licensing / Examination Inquiries"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry or support request..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-medium resize-none"
                  />
                </div>

                <Button type="submit" className="btn-3d-green rounded-2xl px-8 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/25 text-xs">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
