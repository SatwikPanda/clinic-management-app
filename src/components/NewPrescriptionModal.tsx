import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Patient, PrescriptionStatus } from '@/types/database';

interface NewPrescriptionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export default function NewPrescriptionModal({ onClose, onSuccess }: NewPrescriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', frequency: '' }]);
  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    notes: '',
    status: 'active' as PrescriptionStatus
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch patients
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, name, phone');
      setPatients(patientsData || []);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get doctor ID
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

      if (!doctorData?.id) {
        throw new Error('No doctor found');
      }

      // Create prescription
      const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert([{
          patient_id: formData.patient_id,
          doctor_id: doctorData.id,
          diagnosis: formData.diagnosis,
          notes: formData.notes,
          status: 'active'
        }])
        .select()
        .single();

      if (prescriptionError) {
        console.error('Prescription error:', prescriptionError);
        throw prescriptionError;
      }

      if (!prescription) {
        throw new Error('Failed to create prescription');
      }

      console.log('Created prescription:', prescription);

      // Create medications
      const medicationsData = medications.map(med => ({
        prescription_id: prescription.id,
        name: med.name.trim(),
        dosage: med.dosage.trim(),
        frequency: med.frequency.trim()
      }));

      console.log('Creating medications:', medicationsData);

      const { error: medicationsError } = await supabase
        .from('medications')
        .insert(medicationsData);

      if (medicationsError) {
        console.error('Medications error:', medicationsError);
        // Rollback prescription if medications fail
        await supabase
          .from('prescriptions')
          .delete()
          .eq('id', prescription.id);
        throw medicationsError;
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '' }]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setMedications(newMedications);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">New Prescription</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
              <input
                type="text"
                required
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter diagnosis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medications
                <button
                  type="button"
                  onClick={addMedication}
                  className="ml-4 text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Another
                </button>
              </label>
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        required
                        value={med.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="Medicine name"
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        required
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="Dosage"
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        required
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        placeholder="Frequency"
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-500 hover:text-red-700 mt-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                placeholder="Add any special instructions..."
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
              {loading ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
