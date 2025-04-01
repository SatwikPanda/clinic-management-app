"use client";
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AppointmentStatus } from '@/types/database';


type AppointmentDetails = {
  id: string;
  status: string;
  date: string;
  time: string;
  doctor: string;
  patientName: string;
  notes?: string | null;
};


export default function CheckAppointment() {
  const [appointmentId, setAppointmentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 border-red-200';
      case 'completed':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAppointmentDetails(null);

    try {
      // Query appointment from Supabase
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_id(name),
          patient:patient_id(*)
        `)
        .eq('confirmation_id', appointmentId)
        .eq('patient.phone', phoneNumber)
        .single();

      if (error) throw error;

      if (!appointment) {
        throw new Error('Appointment not found or phone number does not match');
      }

      setAppointmentDetails({
        id: appointment.confirmation_id,
        status: appointment.status as AppointmentStatus,
        date: appointment.date,
        time: appointment.time,
        doctor: appointment.doctor.name,
        patientName: appointment.patient.name,
        notes: appointment.notes
      });
    } catch (error) {
      console.error('Error:', error);
      setError('Invalid confirmation ID or phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Check Appointment Status
            </span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleCheck} className="space-y-6">
              <div className="space-y-2">
                <label className="text-gray-700 font-medium">Appointment ID</label>
                <input
                  type="text"
                  value={appointmentId}
                  onChange={(e) => setAppointmentId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors text-gray-900"
                  placeholder="Enter your appointment ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors text-gray-900"
                  placeholder="Enter your credentials"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {appointmentDetails && (
              <div className={`mt-8 p-6 rounded-lg border ${getStatusColor(appointmentDetails.status)}`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
                <div className="space-y-2 text-gray-800">
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                      appointmentDetails.status.toLowerCase() === 'confirmed' ? 'bg-green-200 text-green-800' :
                      appointmentDetails.status.toLowerCase() === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      appointmentDetails.status.toLowerCase() === 'cancelled' ? 'bg-red-200 text-red-800' :
                      appointmentDetails.status.toLowerCase() === 'completed' ? 'bg-blue-200 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {appointmentDetails.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Date:</span> {new Date(appointmentDetails.date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Time:</span> {appointmentDetails.time}</p>
                  <p><span className="font-medium">Doctor:</span> {appointmentDetails.doctor}</p>
                  {appointmentDetails.notes && (
                    <p><span className="font-medium">Notes:</span> {appointmentDetails.notes}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
