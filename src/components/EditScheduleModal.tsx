import { useState } from 'react';

interface DaySchedule {
  day: string;
  slots: string[];
  status?: 'Half Day' | 'Closed';
}

interface EditScheduleModalProps {
  currentSchedule: DaySchedule[];
  onSave: (schedule: DaySchedule[]) => Promise<void>;
  onClose: () => void;
}

export default function EditScheduleModal({ currentSchedule, onSave, onClose }: EditScheduleModalProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(currentSchedule);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  const dayStatuses = ['Regular', 'Half Day', 'Closed'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate slots
      for (const day of schedule) {
        if (day.status !== 'Closed' && day.slots.length === 0) {
          throw new Error(`${day.day} must have at least one time slot or be marked as Closed`);
        }
      }

      await onSave(schedule);
      onClose();
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      setError(error?.message || 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  const updateDayStatus = (dayIndex: number, status: string) => {
    const newSchedule = [...schedule];
    if (status === 'Closed') {
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        slots: [],
        status: 'Closed'
      };
    } else if (status === 'Half Day') {
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        slots: ['09:00 - 13:00'],
        status: 'Half Day'
      };
    } else {
      // Regular day
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        slots: ['09:00 - 13:00', '14:00 - 17:00'],
        status: undefined
      };
    }
    setSchedule(newSchedule);
  };

  const addSlot = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      slots: [...newSchedule[dayIndex].slots, '09:00 - 17:00']
    };
    setSchedule(newSchedule);
  };

  const updateSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    const newSchedule = [...schedule];
    const slots = [...newSchedule[dayIndex].slots];
    const [start, end] = slots[slotIndex].split(' - ');
    slots[slotIndex] = field === 'start' ? `${value} - ${end}` : `${start} - ${value}`;
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], slots };
    setSchedule(newSchedule);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    const slots = newSchedule[dayIndex].slots.filter((_, i) => i !== slotIndex);
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], slots };
    setSchedule(newSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex text-neutral-800 items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Edit Weekly Schedule</h2>
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
            {schedule.map((day, dayIndex) => (
              <div key={day.day} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">{day.day}</h3>
                  <select
                    value={day.status || 'Regular'}
                    onChange={(e) => updateDayStatus(dayIndex, e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {dayStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {day.status !== 'Closed' && (
                  <div className="space-y-3">
                    {day.slots.map((slot, slotIndex) => {
                      const [start, end] = slot.split(' - ');
                      return (
                        <div key={slotIndex} className="flex items-center gap-4">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                              <select
                                value={start}
                                onChange={(e) => updateSlot(dayIndex, slotIndex, 'start', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              >
                                {timeSlots.map(time => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={end}
                                onChange={(e) => updateSlot(dayIndex, slotIndex, 'end', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              >
                                {timeSlots.map(time => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => removeSlot(dayIndex, slotIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => addSlot(dayIndex)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Time Slot
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

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
