"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { CheckCircle, Mail, ArrowLeft } from "lucide-react"

export default function SignUpSuccessPage() {
  const { language } = useLanguage()

  const successTranslations = {
    en: {
      title: "Check Your Email",
      subtitle: "We've sent you a confirmation link",
      message:
        "Please check your email and click the confirmation link to activate your FarmByte account. Once confirmed, you'll be able to access your dashboard.",
      checkSpam: "Don't see the email? Check your spam folder or",
      resendLink: "request a new confirmation email",
      backToHome: "Back to Home",
      signIn: "Sign In",
    },
    hi: {
      title: "अपना ईमेल चेक करें",
      subtitle: "हमने आपको एक पुष्टिकरण लिंक भेजा है",
      message:
        "कृपया अपना ईमेल चेक करें और अपने FarmByte खाते को सक्रिय करने के लिए पुष्टिकरण लिंक पर क्लिक करें। पुष्टि के बाद, आप अपने डैशबोर्ड तक पहुंच सकेंगे।",
      checkSpam: "ईमेल नहीं दिख रहा? अपना स्पैम फ़ोल्डर चेक करें या",
      resendLink: "नया पुष्टिकरण ईमेल का अनुरोध करें",
      backToHome: "होम पर वापस",
      signIn: "साइन इन",
    },
  }

  const st = successTranslations[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-green-600 hover:text-green-700">
            <ArrowLeft className="h-4 w-4" />
            {st.backToHome}
          </Link>
          <LanguageSwitcher />
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="font-bold text-xl text-green-600">FarmByte</span>
            </div>
            <CardTitle className="text-2xl">{st.title}</CardTitle>
            <CardDescription>{st.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{st.message}</p>
              </div>

              <p className="text-sm text-gray-500">
                {st.checkSpam}{" "}
                <button className="text-green-600 hover:text-green-700 font-medium">{st.resendLink}</button>
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/auth/login">{st.signIn}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/">{st.backToHome}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
