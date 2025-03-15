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
                Dr Sanjeev's ENT healthcare
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed tracking-tight">
                
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
              { number: "98%", label: "Success Rate" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-8 rounded-xl bg-white shadow-xl hover:shadow-2xl transition-shadow"
              >
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
      <section
        className="py-32 bg-gradient-to-b from-white to-blue-50"
        id="about"
      >
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
                <p className="text-xl text-gray-600">
                  Senior Consultant & HOD ENT, Head & Neck Surgery
                </p>
              </div>

              <p className="text-gray-600 leading-relaxed">
                An experienced ENT, Head & Neck surgeon with over 25 years of
                experience, Prof Dr Sanjeev Mohanty is a Senior Consultant and
                the Head of the Institute of ENT, Head & Neck Surgery. An
                alumnus of SCB Medical College, he practices obstructive sleep
                apnoea surgery and phonosurgery to complete the spectrum of
                modern-day otolaryngology clinical practice. His special
                interests revolve around advanced otology, cochlear
                implantation, endoscopic skull base and head and neck
                oncosurgery.
              </p>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Internal Medicine",
                    "Preventive Care",
                    "Chronic Disease Management",
                    "Geriatric Care",
                  ].map((specialty) => (
                    <span
                      key={specialty}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Education
                </h3>
                <ul className="space-y-2 text-neutral-800">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-1 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H4"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">
                        SCB Medical College and Hospital, Cuttack, Odisha
                      </p>
                      <p className="text-sm text-gray-600">
                        Doctor of Medicine, 1992
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-1 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H4"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">
                        MKCG Medical College and Hospital, Berhampur, Odisha
                      </p>
                      <p className="text-sm text-gray-600">
                        MS (Master of Surgery) in ENT, 1997
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
