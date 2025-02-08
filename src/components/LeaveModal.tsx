import { useState } from 'react';
import { Leave } from '@/types/database';

interface LeaveModalProps {
  currentLeaves: Leave[];
  onSave: (leaves: Leave[]) => Promise<void>;
  onClose: () => void;
}

export default function LeaveModal({ currentLeaves, onSave, onClose }: LeaveModalProps) {
  const [leaves, setLeaves] = useState<Leave[]>(currentLeaves);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get tomorrow's date for min attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate dates are not in the past and have reasons
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const leave of leaves) {
        const leaveDate = new Date(leave.date);
        leaveDate.setHours(0, 0, 0, 0);

        if (leaveDate < today) {
          throw new Error('Leave dates cannot be in the past');
        }

        if (!leave.reason.trim()) {
          throw new Error('All leaves must have a reason');
        }
      }

      // Check for duplicate dates
      const dates = leaves.map(l => l.date);
      if (new Set(dates).size !== dates.length) {
        throw new Error('Duplicate leave dates are not allowed');
      }
      
      await onSave(leaves);
      onClose();
    } catch (error: any) {
      console.error('Error updating leaves:', error);
      setError(error?.message || 'Failed to update leaves');
    } finally {
      setLoading(false);
    }
  };

  const addLeave = () => {
    setLeaves([...leaves, { 
      date: minDate,
      reason: ''
    }]);
  };

  const updateLeave = (index: number, field: keyof Leave, value: string) => {
    const newLeaves = [...leaves];
    newLeaves[index] = { ...newLeaves[index], [field]: value };
    setLeaves(newLeaves);
  };

  const removeLeave = (index: number) => {
    setLeaves(leaves.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 text-neutral-800 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Book Upcoming Leaves</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {leaves.map((leave, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={leave.date}
                      min={minDate}
                      onChange={(e) => updateLeave(index, 'date', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <input
                      type="text"
                      value={leave.reason}
                      onChange={(e) => updateLeave(index, 'reason', e.target.value)}
                      placeholder="Enter reason for leave"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLeave(index)}
                  className="mt-8 text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLeave}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Add Another Leave
          </button>

          <div className="flex justify-end gap-4 pt-4 border-t">
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
