import React, { useState } from 'react';
import { FiList, FiUsers, FiMail, FiImage, FiEye, FiPlus, FiFileText, FiInfo } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateElection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const steps = [
    { key: 'basic', label: 'Basic Info', icon: <FiList /> },
    { key: 'voters', label: 'Voters', icon: <FiUsers /> },
    { key: 'ballot', label: 'Ballot', icon: <FiList /> },
    { key: 'emails', label: 'Emails', icon: <FiMail /> },
    { key: 'branding', label: 'Branding', icon: <FiImage /> },
    { key: 'preview', label: 'Preview', icon: <FiEye /> },
    { key: 'launch', label: 'Launch', icon: <FiPlus /> },
  ]

  return (
    <div className="flex gap-8">
      {/* desktop left steps */}
      <aside className="hidden md:block w-64">
        <div className="bg-white rounded-md p-4 border border-slate-100">
          <ul className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.key} className={`flex items-center gap-3 ${i === activeStep ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>
                <input type="checkbox" className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  <span className="text-sm">{s.icon}</span>
                  <span className="ml-2">{s.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* mobile steps shown at top before the Basic Information card */}
        <div className="md:hidden mb-4">
          <div className="bg-white rounded-md p-2 border border-slate-100">
            <ul className="space-y-2">
              {steps.map((s, i) => (
                <li key={s.key} className={`flex items-center gap-3 px-3 py-2 rounded-md ${i === activeStep ? 'bg-blue-50 text-blue-600' : 'text-slate-700'}`}>
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-sm">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
              <FiFileText size={18} />
            </div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Election title*</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTitleTouched(true)}
                className={`mt-2 w-full rounded-md p-3 text-sm outline-none border ${titleTouched && !title.trim() ? 'border-rose-400' : 'border-slate-200'} focus:border-blue-400`}
                placeholder="Senate Elections 2025"
              />
              {titleTouched && !title.trim() && (
                <p className="mt-1 text-xs text-rose-500">Please include your election name</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <button type="button" className="text-slate-500" aria-label="Description help">
                  <FiInfo size={16} />
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-md p-3 text-sm h-24 outline-none focus:border-blue-400 resize-none"
                placeholder="This election will determine the new executives for the Faculty of Engineering for the 2025 academic year."
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-slate-700">Election Date & Time</label>
                <button type="button" className="text-slate-500" aria-label="Date and time help">
                  <FiInfo size={16} />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Start</label>
                  <div className="mt-1">
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date | null) => setStartDate(date)}
                      showTimeSelect
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      placeholderText="MM/DD/YYYY h:mm am/pm"
                      className="w-full rounded-md border border-slate-200 p-2 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">End</label>
                  <div className="mt-1">
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date | null) => setEndDate(date)}
                      showTimeSelect
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      placeholderText="MM/DD/YYYY h:mm am/pm"
                      className="w-full rounded-md border border-slate-200 p-2 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">Save & Continue</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateElection
