import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12 w-full">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold font-outfit text-white">Get in Touch with Rexam Team</h1>
          <p className="text-slate-300 text-sm">Have questions about exam setup, AI proctoring, or institutional accounts? We are here to support you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-3xl border border-white/10 flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Email Support</h3>
                <p className="text-xs text-slate-400 mt-1">support@rexam.ai</p>
                <p className="text-xs text-slate-400">admin@rexam.ai</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Helpline Number</h3>
                <p className="text-xs text-slate-400 mt-1">+91 1800-REXAM-AI</p>
                <p className="text-xs text-slate-400">Mon - Sat (9:00 AM - 7:00 PM IST)</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 flex items-start space-x-4">
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
          <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-xl font-bold font-outfit text-white">Send Us a Message</h2>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Sent Successfully!</h3>
                <p className="text-xs text-slate-300">Thank you for reaching out. Our support team will get back to your email within 24 hours.</p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="rounded-full mt-2">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Poornachandran Kasilingam"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Exam code issue / Feature inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="rounded-full px-8 font-bold bg-blue-600 hover:bg-blue-500">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
