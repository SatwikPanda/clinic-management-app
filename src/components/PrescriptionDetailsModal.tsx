import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface PrescriptionDetailsModalProps {
  prescription: any;
  onClose: () => void;
}

export default function PrescriptionDetailsModal({ prescription, onClose }: PrescriptionDetailsModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Prescription-${prescription.id}`,
    onAfterPrint: () => console.log('Printed successfully'),
    onPrintError: (error) => console.error('Print failed:', error),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header - Not included in print */}
        <div className="p-6 border-b border-gray-100 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Prescription Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={componentRef} className="p-6">
          {/* Clinic Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">HealthCare Clinic</h1>
            <div className="mt-2 text-sm text-gray-500">
              Date: {formatDate(prescription.created_at)}
            </div>
          </div>

          {/* Patient Info */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h2>
            <p className="text-gray-700">Name: {prescription.patient?.name}</p>
          </div>

          {/* Diagnosis */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Diagnosis</h2>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {prescription.diagnosis}
            </p>
          </div>

          {/* Medications */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Medications</h2>
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left border text-gray-600">Medicine</th>
                  <th className="px-4 py-2 text-left border text-gray-600">Dosage</th>
                  <th className="px-4 py-2 text-left border text-gray-600">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medications?.map((med: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border text-gray-800">{med.name}</td>
                    <td className="px-4 py-2 border text-gray-800">{med.dosage}</td>
                    <td className="px-4 py-2 border text-gray-800">{med.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h2>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {prescription.notes}
              </p>
            </div>
          )}

          {/* Doctor's Signature Space */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="text-center">
                <div className="mb-8 h-8">
                  {/* Space for signature */}
                </div>
                <p className="text-gray-800 font-medium">Doctor's Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Not included in print */}
        <div className="p-6 border-t border-gray-100 print:hidden">
          <div className="flex justify-end gap-4">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Print Prescription
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
