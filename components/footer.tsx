import { Twitter, Linkedin, Instagram } from "lucide-react"
import Image from "next/image"
import heroImage from "@/public/untitleddesign.png"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image src={heroImage} alt="Instagram AI" width={32} height={32} className="rounded" />
              <span className="text-xl font-bold">Instagram AI</span>
            </div>
            <p className="text-sm opacity-80 text-pretty">
              Automate your Instagram DMs and grow your business faster with intelligent conversation flows.
            </p>
            {/* <div className="flex gap-4">
              <Twitter className="h-5 w-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Linkedin className="h-5 w-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Instagram className="h-5 w-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
            </div> */}
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="/features" className="hover:opacity-100 transition-opacity">
                  Features
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:opacity-100 transition-opacity">
                  Pricing
                </a>
              </li>
              {/* <li>
                <a href="/integrations" className="hover:opacity-100 transition-opacity">
                  Integrations
                </a>
              </li> */}
              {/* <li>
                <a href="/api" className="hover:opacity-100 transition-opacity">
                  API
                </a>
              </li> */}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="/about" className="hover:opacity-100 transition-opacity">
                  About
                </a>
              </li>
              {/* <li>
                <a href="/blog" className="hover:opacity-100 transition-opacity">
                  Blog
                </a>
              </li>
              <li>
                <a href="/careers" className="hover:opacity-100 transition-opacity">
                  Careers
                </a>
              </li> */}
              <li>
                <a href="/contact" className="hover:opacity-100 transition-opacity">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="/help-center" className="hover:opacity-100 transition-opacity">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="hover:opacity-100 transition-opacity">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="hover:opacity-100 transition-opacity">
                  Terms of Service
                </a>
              </li>
              {/* <li>
                <a href="/status" className="hover:opacity-100 transition-opacity">
                  Status
                </a>
              </li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm opacity-60">
          <p>&copy; 2025 instagram. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
