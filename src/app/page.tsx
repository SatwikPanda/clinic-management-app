"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              HealthCare Clinic
            </span>
            <div className="flex gap-4">
              <Link 
                href="/check-appointment"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Check Appointment
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Doctor & Staff Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-32" id="home">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tighter">
                Modern ENT care for Everyone
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed tracking-tight">
                Experience state-of-the-art medical care with a personal touch.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link 
                  href="/book-appointment"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 text-center min-w-[200px] flex items-center justify-center"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/check-appointment"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all duration-300 text-center min-w-[200px] flex items-center justify-center"
                >
                  Check Appointment
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <Image
                  src="/medical-hero.jpg"
                  alt="Modern Medical Facility"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl relative"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { number: "15+", label: "Years Experience" },
              { number: "50k+", label: "Patients Served" },
              { number: "30+", label: "Specialists" },
              { number: "98%", label: "Success Rate" }
            ].map((stat) => (
              <div key={stat.label} className="text-center p-8 rounded-xl bg-white shadow-xl hover:shadow-2xl transition-shadow">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 bg-gradient-to-b from-white to-blue-50" id="about">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <Image
                src="/doctor-profile.jpg"
                alt="Dr. Sanjeev Mohanty"
                width={500}
                height={600}
                className="rounded-2xl shadow-2xl object-cover"
                priority
              />
            </div>
            
            <div className="md:w-1/2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Dr. Sanjeev Mohanty
                </h2>
                <p className="text-xl text-gray-600">Senior Consultant & HOD
                ENT, Head & Neck Surgery</p>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
              An experienced ENT, Head & Neck surgeon with over 25 years of experience, Prof Dr Sanjeev Mohanty is a Senior Consultant and the Head of the Institute of ENT, Head & Neck Surgery. An alumnus of SCB Medical College, he practices obstructive sleep apnoea surgery and phonosurgery to complete the spectrum of modern-day otolaryngology clinical practice. His special interests revolve around advanced otology, cochlear implantation, endoscopic skull base and head and neck oncosurgery.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Specializations</h3>
                <div className="flex flex-wrap gap-3">
                  {['Internal Medicine', 'Preventive Care', 'Chronic Disease Management', 'Geriatric Care'].map((specialty) => (
                    <span key={specialty} 
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Education</h3>
                <ul className="space-y-2 text-neutral-800">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                    <div>
                      <p className="font-medium">SCB Medical College and Hospital, Cuttack, Odisha</p>
                      <p className="text-sm text-gray-600">Doctor of Medicine, 1992</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                    <div>
                      <p className="font-medium">MKCG Medical College and Hospital, Berhampur, Odisha</p>
                      <p className="text-sm text-gray-600">MS (Master of Surgery) in ENT, 1997</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-gradient-to-b from-white to-blue-50" id="services">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Our Medical Services
            </h2>
            <p className="text-gray-600 text-lg">
              Comprehensive healthcare solutions tailored to your needs with cutting-edge technology and expert care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "General Check-up",
                description: "Comprehensive health screening and preventive care to maintain your wellbeing.",
                icon: "🏥",
                features: ["Regular Health Monitoring", "Preventive Care", "Health Records"]
              },
              {
                title: "Specialized Care",
                description: "Expert medical care from experienced specialists in various fields.",
                icon: "⚕️",
                features: ["Expert Consultation", "Advanced Treatment", "Personalized Care"]
              },
              {
                title: "Emergency Services",
                description: "24/7 emergency medical care with rapid response and expert treatment.",
                icon: "🚑",
                features: ["24/7 Availability", "Rapid Response", "Critical Care"]
              }
            ].map((service) => (
              <div key={service.title} 
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute -top-8 left-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                  <span className="text-white">{service.icon}</span>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-8 px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-300 w-full">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              What Our Patients Say
            </h2>
            <p className="text-gray-600 text-lg">
              Real experiences from our valued patients who trusted us with their healthcare journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                text: "The medical staff here is exceptional. They took great care of me and made sure I understood every step of my treatment.",
                author: "John Davidson",
                role: "Patient since 2021",
                rating: 5,
                image: "/testimonial1.jpeg"
              },
              {
                text: "Best healthcare experience I've ever had. The facilities are modern and the staff is incredibly professional and caring.",
                author: "Maria Santos",
                role: "Patient since 2022",
                rating: 5,
                image: "/testimonial2.jpg"
              }
            ].map((testimonial, index) => (
              <div key={testimonial.author} 
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">"</span>
                </div>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{testimonial.author}</h3>
                    <p className="text-gray-500">{testimonial.role}</p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-lg leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 bg-gradient-to-b from-white to-blue-50" id="contact">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-gray-600 text-lg">
              We're here to help. Reach out to us for any medical assistance or inquiries.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <input 
                      type="text" 
                      id="name"
                      className="peer w-full px-4 py-3 rounded-lg border-2 border-gray-200 placeholder-transparent focus:border-blue-600 focus:outline-none transition-colors"
                      placeholder="Your Name"
                    />
                    <label 
                      htmlFor="name"
                      className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                      Your Name
                    </label>
                  </div>
                  <div className="relative">
                    <input 
                      type="email" 
                      id="email"
                      className="peer w-full px-4 py-3 rounded-lg border-2 border-gray-200 placeholder-transparent focus:border-blue-600 focus:outline-none transition-colors"
                      placeholder="Email Address"
                    />
                    <label 
                      htmlFor="email"
                      className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                      Email Address
                    </label>
                  </div>
                </div>
                <div className="relative">
                  <textarea 
                    id="message"
                    rows={4}
                    className="peer w-full px-4 py-3 rounded-lg border-2 border-gray-200 placeholder-transparent focus:border-blue-600 focus:outline-none transition-colors resize-none"
                    placeholder="Your Message"
                  ></textarea>
                  <label 
                    htmlFor="message"
                    className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                  >
                    Your Message
                  </label>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-8 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-medium">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Visit Us",
                info: "123 Medical Center Drive",
                subInfo: "New York, NY 10001"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
                title: "Call Us",
                info: "(555) 123-4567",
                subInfo: "Mon-Fri 9:00 AM - 6:00 PM"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Email Us",
                info: "contact@healthcare.com",
                subInfo: "We'll respond within 24 hours"
              },
            ].map((contact) => (
              <div key={contact.title} 
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/80 to-cyan-500/80 rounded-lg flex items-center justify-center mb-4">
                  {contact.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{contact.title}</h3>
                <p className="text-gray-300 mb-1">{contact.info}</p>
                <p className="text-gray-400 text-sm">{contact.subInfo}</p>
              </div>
            ))}
          </div>

          {/* Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                HealthCare Clinic
              </h3>
              <p className="text-gray-400 text-sm">
                Providing quality healthcare services with modern facilities and experienced professionals.
              </p>
            </div>
            {[
              {
                title: "Quick Links",
                links: ["Home", "About", "Services", "Contact"]
              },
              {
                title: "Services",
                links: ["General Check-up", "Specialized Care", "Emergency"]
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Sitemap"]
              }
            ].map((column) => (
              <div key={column.title} className="space-y-4">
                <h4 className="text-lg font-semibold">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8">
            <p className="text-gray-400 text-sm">© 2024 HealthCare Clinic. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              {['Twitter', 'Facebook', 'Instagram'].map((social) => (
                <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
