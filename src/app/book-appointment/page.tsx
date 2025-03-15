"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { appointmentService } from "@/services/appointments";
import { supabase } from "@/lib/supabase"; // Update this import
import { GenderType, BloodGroupType } from '@/types/database';
import { isDateAvailable } from '@/utils/appointmentUtils';

function generateConfirmationId() {
  return 'HC' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function BookAppointment() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "" as GenderType,
    blood_group: "" as BloodGroupType,
    service: "",
    date: "",
    time: "",
    utrNumber: "",
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, name, specialization')
          .limit(1)
          .single();

        if (error) {
          console.error('Database error:', error);
          setError('Failed to fetch doctor: ' + error.message);
          return;
        }

        // Automatically set the doctor
        setSelectedDoctor(data.id);
      } catch (err) {
        console.error('Connection error:', err);
        setError('Database connection failed. Please try again later.');
      } finally {
        setIsInitialized(true);
      }
    };

    fetchDoctor();
  }, []);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.date || !selectedDoctor) return;

      try {
        const slots = await appointmentService.getAvailableSlots(
          formData.date,
          selectedDoctor
        );
        setAvailableSlots(slots);
      } catch (err) {
        setError("Failed to fetch available slots");
      }
    };

    fetchAvailableSlots();
  }, [formData.date, selectedDoctor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleServiceSelect = (service: string) => {
    setFormData({
      ...formData,
      service: service,
    });
  };

  const handleTimeSelect = (time: string) => {
    setFormData({
      ...formData,
      time: time,
    });
  };

  const handleDateChange = async (date: string) => {
    setDateError(null);
    setFormData({ ...formData, date });

    if (!selectedDoctor) {
      setDateError('Please select a doctor first');
      return;
    }

    try {
      const { available, reason } = await isDateAvailable(date, selectedDoctor);
      if (!available) {
        setDateError(reason || 'This date is not available');
        setFormData(prev => ({ ...prev, date: '' }));
      }
    } catch (error) {
      console.error('Error checking date:', error);
      setError('Failed to check date availability');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create patient data
      const patientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        blood_group: formData.blood_group
      };

      console.log('Creating patient:', patientData);

      // Upsert patient (insert if not exists, update if exists)
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .upsert([patientData], {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select('id')
        .single();

      if (patientError) {
        console.error('Patient creation error:', patientError);
        throw new Error(`Failed to create patient: ${patientError.message}`);
      }

      let patientId;
      if (!patient?.id) {
        // If no new patient was created, fetch the existing one
        const { data: existingPatient, error: fetchError } = await supabase
          .from('patients')
          .select('id')
          .eq('email', formData.email)
          .single();

        if (fetchError) throw new Error('Failed to fetch patient');
        patientId = existingPatient.id;
      } else {
        patientId = patient.id;
      }

      // Create appointment with confirmation ID
      const confirmationId = 'HC' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const appointmentData = {
        patient_id: patientId,
        doctor_id: selectedDoctor,
        date: formData.date,
        time: formData.time,
        type: formData.service,
        status: 'pending',
        notes: `Payment UTR: ${formData.utrNumber}`,
        confirmation_id: confirmationId
      };

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (appointmentError) {
        throw new Error(`Failed to create appointment: ${appointmentError.message}`);
      }

      // Pass confirmation ID in the URL
      router.push(`/appointment-confirmation?${new URLSearchParams({
        ...formData,
        confirmationId: appointment.confirmation_id
      }).toString()}`);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1: // Personal Details
        return !!(
          formData.name &&
          formData.phone &&
          formData.email &&
          formData.dob &&
          formData.gender &&
          // Basic validations
          formData.phone.length >= 10 &&
          formData.email.includes('@') &&
          new Date(formData.dob) < new Date()
        );
      
      case 2: // Service Selection
        return !!formData.service;
      
      case 3: // Time Slot
        return !!(
          formData.date &&
          formData.time &&
          !dateError
        );
      
      case 4: // Payment
        return !!(
          formData.utrNumber &&
          formData.utrNumber.length === 12
        );
      
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(step)) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    } else {
      // Show appropriate error message based on step
      let errorMessage = "Please fill in all required fields";
      switch (step) {
        case 1:
          errorMessage = "Please fill in all personal details correctly";
          break;
        case 2:
          errorMessage = "Please select a service";
          break;
        case 3:
          errorMessage = "Please select a valid date and time slot";
          break;
        case 4:
          errorMessage = "Please enter a valid 12-digit UTR number";
          break;
      }
      setError(errorMessage);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const bloodGroups: BloodGroupType[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const genderTypes: GenderType[] = ['male', 'female', 'other'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Home</span>
              </Link>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                HealthCare Clinic
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between mb-12">
            {[
              { number: 1, title: "Personal Details" },
              { number: 2, title: "Select Service" },
              { number: 3, title: "Choose Time" },
              { number: 4, title: "Payment" },
            ].map((s) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s.number
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s.number}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">{s.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z\s]/g, "");
                      }}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors text-gray-900"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors text-gray-900"
                      required
                    >
                      <option value="">Select Gender</option>
                      {genderTypes.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors text-gray-900"
                      placeholder="+91 1234567890"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Blood Group</label>
                    <select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors text-gray-900"
                    >
                      <option value="">Select Blood Group (Optional)</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors text-gray-900"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Select Service
                </h2>

                <div className="space-y-4">
                  <label className="text-gray-700 font-medium">
                    Select Service
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "General Check-up",
                      "Specialized Care",
                      "Emergency Service",
                      "Preventive Care",
                    ].map((service) => (
                      <button
                        key={service}
                        onClick={() => handleServiceSelect(service)}
                        className={`p-4 border-2 ${
                          formData.service === service
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200"
                        } rounded-lg hover:border-blue-600 focus:border-blue-600 focus:outline-none transition-colors text-left`}
                      >
                        <p className="font-medium text-gray-800">{service}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Choose Time Slot
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">
                      Select Date
                    </label>
                    <div>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 text-gray-700 rounded-lg border-2 ${
                          dateError ? 'border-red-300' : 'border-gray-200'
                        } focus:border-blue-600 focus:outline-none transition-colors`}
                        required
                      />
                      {dateError && (
                        <p className="mt-1 text-sm text-red-600">{dateError}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`p-3 border-2 ${
                            formData.time === time
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200"
                          } rounded-lg hover:border-blue-600 hover:text-blue-600 focus:border-blue-600 focus:outline-none transition-colors text-gray-700`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {availableSlots.length === 0 && (
                      <p className="text-gray-600">
                        No slots available for this date. Please select another
                        date.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Payment Details
                </h2>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Consultation Fee</span>
                    <span className="font-semibold text-gray-900">
                      ₹1000.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>GST (18%)</span>
                    <span>₹180.00</span>
                  </div>
                  <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      Total Amount
                    </span>
                    <span className="font-bold text-gray-900">₹1180.00</span>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-6">
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <Image
                      src="/qr-code.jpg"
                      alt="Payment QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-gray-600">Scan QR code to pay</p>
                    <p className="font-medium text-gray-800">
                      UPI ID: 8018436916@axl
                    </p>
                  </div>

                  <div className="w-full max-w-md space-y-2">
                    <label className="text-gray-700 font-medium">
                      Enter UTR Number
                    </label>
                    <input
                      type="text"
                      name="utrNumber"
                      value={formData.utrNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                      placeholder="Enter 12-digit UTR number"
                      maxLength={12}
                    />
                    <p className="text-sm text-gray-500">
                      Please enter the UTR number received after payment
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors text-gray-700"
                >
                  Previous
                </button>
              ) : (
                <Link
                  href="/"
                  className="px-6 py-2 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors text-gray-700"
                >
                  Cancel
                </Link>
              )}
              <button
                onClick={handleNext}
                disabled={loading || !isStepValid(step)}
                className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg transition-all
                  ${isStepValid(step) ? 'hover:shadow-lg hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'}`}
              >
                {loading
                  ? "Processing..."
                  : step === 4
                  ? "Pay & Confirm"
                  : "Next"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
