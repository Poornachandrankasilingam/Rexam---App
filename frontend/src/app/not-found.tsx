import { motion } from "framer-motion"
import { FileQuestion, ArrowLeft, Home } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg text-center relative z-10"
      >
        <div className="glass p-12 rounded-3xl border border-white/10 shadow-2xl">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex p-5 rounded-3xl bg-destructive/10 border border-destructive/20 mb-6 text-destructive"
          >
            <FileQuestion className="h-12 w-12" />
          </motion.div>

          <h1 className="text-6xl font-extrabold tracking-tight text-foreground mb-2">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
            Page Not Found
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button size="lg" className="rounded-xl px-6 font-semibold shadow-lg shadow-primary/20 group w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.history.back()}
              className="rounded-xl px-6 font-semibold bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
