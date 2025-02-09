import { useState } from "react";

interface Leave {
  id?: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface LeaveModalProps {
  currentLeaves: Leave[];
  onSave: (leaves: Leave[]) => void;
  onClose: () => void;
}

export default function LeaveModal({
  currentLeaves,
  onSave,
  onClose,
}: LeaveModalProps) {
  const [leaves, setLeaves] = useState<Leave[]>(currentLeaves);
  const [newLeave, setNewLeave] = useState<Leave>({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleAddLeave = () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;

    // Validate that end date is after start date
    if (new Date(newLeave.endDate) < new Date(newLeave.startDate)) {
      alert("End date must be after start date");
      return;
    }

    setLeaves([...leaves, { ...newLeave, id: Date.now().toString() }]);
    setNewLeave({ startDate: "", endDate: "", reason: "" });
  };

  const handleDeleteLeave = (id: string) => {
    setLeaves(leaves.filter((leave) => leave.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Schedule Leave
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={newLeave.startDate}
              onChange={(e) =>
                setNewLeave({ ...newLeave, startDate: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={newLeave.endDate}
              onChange={(e) =>
                setNewLeave({ ...newLeave, endDate: e.target.value })
              }
              min={newLeave.startDate || new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <input
              type="text"
              value={newLeave.reason}
              onChange={(e) =>
                setNewLeave({ ...newLeave, reason: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason for leave"
            />
          </div>

          <button
            onClick={handleAddLeave}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Leave
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-gray-900">Scheduled Leaves</h4>
          {leaves.map((leave) => (
            <div
              key={leave.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(leave.startDate).toLocaleDateString()} -{" "}
                  {new Date(leave.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">{leave.reason}</p>
              </div>
              <button
                onClick={() => handleDeleteLeave(leave.id!)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(leaves);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
