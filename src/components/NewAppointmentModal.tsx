import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AppointmentStatus } from '@/types/database';
import { isDateAvailable } from '@/utils/appointmentUtils';

interface NewAppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewAppointmentModal({ onClose, onSuccess }: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    date: '',
    time: '',
    status: 'pending' as AppointmentStatus,
    notes: '',
    type: 'Regular Checkup'
  });
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch patients
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, name, phone');
      setPatients(patientsData || []);

      // Fetch doctors
      const { data: doctorsData } = await supabase
        .from('doctors')
        .select('id, name, specialization');
      setDoctors(doctorsData || []);
    };

    fetchData();
  }, []);

  const handleDateChange = async (date: string) => {
    setDateError(null);
    setFormData({ ...formData, date });

    if (!formData.doctor_id) {
      setDateError('Please select a doctor first');
      return;
    }

    try {
      const { available, reason } = await isDateAvailable(date, formData.doctor_id);
      if (!available) {
        setDateError(reason || 'This date is not available');
        setFormData(prev => ({ ...prev, date: '' }));
      }
    } catch (error) {
      console.error('Error checking date:', error);
      setDateError('Failed to check date availability');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDateError(null);

    try {
      // Check date availability again before submitting
      const { available, reason } = await isDateAvailable(formData.date, formData.doctor_id);
      if (!available) {
        throw new Error(reason || 'Selected date is not available');
      }

      // Get doctor ID first
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

      if (!doctor?.id) {
        throw new Error('Doctor not found');
      }

      const { error } = await supabase
        .from('appointments')
        .insert([{
          ...formData,
          confirmation_id: `APT-${Date.now().toString(36).toUpperCase()}`
        }]);

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 text-neutral-800 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">New Appointment</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  dateError ? 'border-red-300' : 'border-gray-200'
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
              />
              {dateError && (
                <p className="mt-1 text-sm text-red-600">{dateError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                placeholder="Add any special notes or instructions..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
