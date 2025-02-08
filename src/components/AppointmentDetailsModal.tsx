import { AppointmentStatus } from '@/types/database';

interface AppointmentDetailsModalProps {
  appointment: any;
  onClose: () => void;
}

export default function AppointmentDetailsModal({ appointment, onClose }: AppointmentDetailsModalProps) {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Appointment ID</p>
              <p className="text-gray-900 font-medium">{appointment.confirmation_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900">{appointment.patient?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{appointment.patient?.phone}</p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-gray-900">{new Date(appointment.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="text-gray-900">{appointment.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="text-gray-900">{appointment.doctor?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-gray-900">{appointment.type || 'Regular Checkup'}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Notes</h3>
              <p className="text-gray-600 text-sm">{appointment.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
