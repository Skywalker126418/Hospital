import React from 'react';
import { Trash2 } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';

const MedicineRow = ({
  index,
  item,
  onChange,
  onRemove,
  isRemovable,
}) => {
  const commonDosages = [
    { value: '250mg', label: '250mg' },
    { value: '500mg', label: '500mg' },
    { value: '10mg', label: '10mg' },
    { value: '20mg', label: '20mg' },
    { value: '1 tablet', label: '1 tablet' },
    { value: '2 tablets', label: '2 tablets' },
    { value: '5 ml', label: '5 ml' },
    { value: '10 ml', label: '10 ml' },
  ];

  const commonFrequencies = [
    { value: 'Once daily (morning)', label: 'Once daily (morning)' },
    { value: 'Once daily (night)', label: 'Once daily (night)' },
    { value: 'Twice daily (12h)', label: 'Twice daily (12h)' },
    { value: 'Three times daily (8h)', label: 'Three times daily (8h)' },
    { value: 'Four times daily (6h)', label: 'Four times daily (6h)' },
    { value: 'Every 4-6 hours PRN', label: 'Every 4-6 hours PRN (As needed)' },
  ];

  const commonDurations = [
    { value: '3 days', label: '3 days' },
    { value: '5 days', label: '5 days' },
    { value: '7 days', label: '7 days' },
    { value: '14 days', label: '14 days' },
    { value: '30 days', label: '30 days' },
    { value: 'Ongoing maintenance', label: 'Ongoing maintenance' },
  ];

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Medication Item #{index + 1}
        </span>
        {isRemovable && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-slate-400 hover:text-rose-600 transition p-1 rounded-lg"
            title="Remove Medication"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Medicine Name */}
        <div className="md:col-span-2">
          <Input
            label="Medicine Name"
            name={`med_name_${index}`}
            value={item.medicine_name}
            onChange={(e) => onChange(index, 'medicine_name', e.target.value)}
            placeholder="e.g. Amoxicillin, Lisinopril, Paracetamol"
            required
          />
        </div>

        {/* Dosage */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Dosage <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            list={`dosage_list_${index}`}
            value={item.dosage}
            onChange={(e) => onChange(index, 'dosage', e.target.value)}
            placeholder="e.g. 500mg"
            className="block w-full rounded-lg border border-slate-300 py-2.5 px-3.5 text-sm focus:border-brand-500 focus:ring-brand-500 bg-white"
            required
          />
          <datalist id={`dosage_list_${index}`}>
            {commonDosages.map((d) => (
              <option key={d.value} value={d.value} />
            ))}
          </datalist>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Duration <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            list={`duration_list_${index}`}
            value={item.duration}
            onChange={(e) => onChange(index, 'duration', e.target.value)}
            placeholder="e.g. 7 days"
            className="block w-full rounded-lg border border-slate-300 py-2.5 px-3.5 text-sm focus:border-brand-500 focus:ring-brand-500 bg-white"
            required
          />
          <datalist id={`duration_list_${index}`}>
            {commonDurations.map((d) => (
              <option key={d.value} value={d.value} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Frequency */}
        <div>
          <Select
            label="Frequency"
            name={`freq_${index}`}
            value={item.frequency}
            onChange={(e) => onChange(index, 'frequency', e.target.value)}
            options={commonFrequencies}
            placeholder="Select Frequency"
            required
          />
        </div>

        {/* Instructions */}
        <div>
          <Input
            label="Special Instructions (Optional)"
            name={`inst_${index}`}
            value={item.instructions}
            onChange={(e) => onChange(index, 'instructions', e.target.value)}
            placeholder="e.g. Take after meals with plenty of water"
          />
        </div>
      </div>
    </div>
  );
};

export default MedicineRow;
