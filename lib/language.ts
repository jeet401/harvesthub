// Language support for FarmByte marketplace
export type Language = "en" | "hi"

export interface Translations {
  // Navigation
  nav: {
    home: string
    howItWorks: string
    signIn: string
    signUpFarmer: string
    language: string
  }
  // Hero section
  hero: {
    title: string
    subtitle: string
    signInBuyer: string
    signInFarmer: string
    learnMore: string
  }
  // How it works section
  howItWorks: {
    title: string
    subtitle: string
    step1Title: string
    step1Desc: string
    step2Title: string
    step2Desc: string
    step3Title: string
    step3Desc: string
    step4Title: string
    step4Desc: string
  }
  // Features section
  features: {
    title: string
    subtitle: string
    feature1Title: string
    feature1Desc: string
    feature2Title: string
    feature2Desc: string
    feature3Title: string
    feature3Desc: string
    feature4Title: string
    feature4Desc: string
  }
  // Categories section
  categories: {
    title: string
    subtitle: string
    fruits: string
    vegetables: string
    seeds: string
    fertilizers: string
  }
  // Footer
  footer: {
    tagline: string
    quickLinks: string
    contact: string
    followUs: string
    copyright: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      howItWorks: "How It Works",
      signIn: "Sign In",
      signUpFarmer: "Sign Up as Farmer",
      language: "Language",
    },
    hero: {
      title: "Connect Farmers Directly to Buyers",
      subtitle:
        "Fresh produce, seeds, and fertilizers delivered straight from the farm to your doorstep. Supporting local farmers while getting the best quality products.",
      signInBuyer: "Shop as Buyer",
      signInFarmer: "Sell as Farmer",
      learnMore: "Learn More",
    },
    howItWorks: {
      title: "How FarmByte Works",
      subtitle: "Simple steps to connect farmers and buyers for fresh, quality produce",
      step1Title: "Farmers List Products",
      step1Desc: "Local farmers upload their fresh produce, seeds, and fertilizers with competitive prices",
      step2Title: "Buyers Browse & Order",
      step2Desc: "Customers explore products by category and place orders directly from farmers",
      step3Title: "Secure Payment",
      step3Desc: "Safe and secure payment processing with multiple payment options",
      step4Title: "Direct Delivery",
      step4Desc: "Fresh products delivered directly from farm to your location",
    },
    features: {
      title: "Why Choose FarmByte?",
      subtitle: "Connecting communities through fresh, local produce",
      feature1Title: "Direct from Farm",
      feature1Desc: "Skip the middleman and get fresh produce directly from local farmers",
      feature2Title: "Fair Prices",
      feature2Desc: "Better prices for buyers and fair compensation for farmers",
      feature3Title: "Quality Assured",
      feature3Desc: "Fresh, high-quality products with farmer verification",
      feature4Title: "Support Local",
      feature4Desc: "Support your local farming community and sustainable agriculture",
    },
    categories: {
      title: "Product Categories",
      subtitle: "Everything you need from farm to table",
      fruits: "Fresh Fruits",
      vegetables: "Vegetables",
      seeds: "Seeds",
      fertilizers: "Fertilizers",
    },
    footer: {
      tagline: "Connecting farmers and buyers for a sustainable future",
      quickLinks: "Quick Links",
      contact: "Contact Us",
      followUs: "Follow Us",
      copyright: "© 2024 FarmByte. All rights reserved.",
    },
  },
  hi: {
    nav: {
      home: "होम",
      howItWorks: "कैसे काम करता है",
      signIn: "साइन इन",
      signUpFarmer: "किसान के रूप में साइन अप",
      language: "भाषा",
    },
    hero: {
      title: "किसानों को सीधे खरीदारों से जोड़ें",
      subtitle:
        "ताजा उत्पाद, बीज और उर्वरक सीधे खेत से आपके दरवाजे तक। बेहतरीन गुणवत्ता के उत्पाद पाते हुए स्थानीय किसानों का समर्थन करें।",
      signInBuyer: "खरीदार के रूप में खरीदारी",
      signInFarmer: "किसान के रूप में बेचें",
      learnMore: "और जानें",
    },
    howItWorks: {
      title: "FarmByte कैसे काम करता है",
      subtitle: "ताजा, गुणवत्तापूर्ण उत्पादों के लिए किसानों और खरीदारों को जोड़ने के सरल चरण",
      step1Title: "किसान उत्पाद सूचीबद्ध करते हैं",
      step1Desc: "स्थानीय किसान प्रतिस्पर्धी कीमतों के साथ अपने ताजा उत्पाद, बीज और उर्वरक अपलोड करते हैं",
      step2Title: "खरीदार ब्राउज़ और ऑर्डर करते हैं",
      step2Desc: "ग्राहक श्रेणी के अनुसार उत्पादों का अन्वेषण करते हैं और सीधे किसानों से ऑर्डर देते हैं",
      step3Title: "सुरक्षित भुगतान",
      step3Desc: "कई भुगतान विकल्पों के साथ सुरक्षित भुगतान प्रसंस्करण",
      step4Title: "सीधी डिलीवरी",
      step4Desc: "ताजा उत्पाद सीधे खेत से आपके स्थान पर पहुंचाए जाते हैं",
    },
    features: {
      title: "FarmByte क्यों चुनें?",
      subtitle: "ताजा, स्थानीय उत्पादों के माध्यम से समुदायों को जोड़ना",
      feature1Title: "सीधे खेत से",
      feature1Desc: "बिचौलिए को छोड़ें और स्थानीय किसानों से सीधे ताजा उत्पाद प्राप्त करें",
      feature2Title: "उचित कीमतें",
      feature2Desc: "खरीदारों के लिए बेहतर कीमतें और किसानों के लिए उचित मुआवजा",
      feature3Title: "गुणवत्ता का आश्वासन",
      feature3Desc: "किसान सत्यापन के साथ ताजा, उच्च गुणवत्ता वाले उत्पाद",
      feature4Title: "स्थानीय का समर्थन",
      feature4Desc: "अपने स्थानीय कृषि समुदाय और टिकाऊ कृषि का समर्थन करें",
    },
    categories: {
      title: "उत्पाद श्रेणियां",
      subtitle: "खेत से मेज तक आपकी हर जरूरत",
      fruits: "ताजे फल",
      vegetables: "सब्जियां",
      seeds: "बीज",
      fertilizers: "उर्वरक",
    },
    footer: {
      tagline: "एक टिकाऊ भविष्य के लिए किसानों और खरीदारों को जोड़ना",
      quickLinks: "त्वरित लिंक",
      contact: "संपर्क करें",
      followUs: "हमें फॉलो करें",
      copyright: "© 2024 FarmByte। सभी अधिकार सुरक्षित।",
    },
  },
}
