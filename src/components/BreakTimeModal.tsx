import { useState } from 'react';

interface Break {
  start: string;
  end: string;
  type: string;
}

interface BreakTimeModalProps {
  currentBreaks: Break[];
  onSave: (breaks: Break[]) => void;
  onClose: () => void;
}

export default function BreakTimeModal({ currentBreaks, onSave, onClose }: BreakTimeModalProps) {
  const [breaks, setBreaks] = useState<Break[]>(currentBreaks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [
      `${hour}:00`,
      `${hour}:30`
    ];
  }).flat();

  const breakTypes = [
    'Lunch Break',
    'Tea Break',
    'Short Break',
    'Meeting',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (breaks.some(b => b.end <= b.start)) {
        throw new Error('Break end time must be after start time');
      }
      
      await onSave(breaks);
      onClose();
    } catch (error: any) {
      console.error('Error updating breaks:', error);
      setError(error?.message || 'Failed to update breaks');
    } finally {
      setLoading(false);
    }
  };

  const addBreak = () => {
    setBreaks([...breaks, { start: '12:00', end: '13:00', type: 'Short Break' }]);
  };

  const updateBreak = (index: number, field: keyof Break, value: string) => {
    const newBreaks = [...breaks];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setBreaks(newBreaks);
  };

  const removeBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center text-neutral-800 justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Manage Break Times</h2>
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
            {breaks.map((breakItem, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={breakItem.type}
                      onChange={(e) => updateBreak(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {breakTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start</label>
                    <select
                      value={breakItem.start}
                      onChange={(e) => updateBreak(index, 'start', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {timeSlots.map(time => (
                        <option key={`start-${time}`} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End</label>
                    <select
                      value={breakItem.end}
                      onChange={(e) => updateBreak(index, 'end', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {timeSlots.map(time => (
                        <option key={`end-${time}`} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeBreak(index)}
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
            onClick={addBreak}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Add Another Break
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
