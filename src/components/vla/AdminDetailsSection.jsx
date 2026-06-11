import React from "react";

const inputClass = "border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400";

export default function AdminDetailsSection({ form, onChange }) {
  return (
    <section className="mb-8">
      <div className="text-xs font-bold tracking-widest text-purple-700 uppercase border-b border-gray-300 dark:border-gray-600 pb-2 mb-6">
        Client Details
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex flex-col gap-1 justify-end">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Client Name <span className="text-purple-700">*</span>
          </label>
          <input
            type="text"
            value={form.client_name}
            onChange={(e) => onChange("client_name", e.target.value)}
            placeholder="Full legal name"
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col gap-1 justify-end">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Client DOB <span className="text-purple-700">*</span>
          </label>
          <input
            type="date"
            value={form.client_dob}
            onChange={(e) => onChange("client_dob", e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col gap-1 justify-end">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">File Reference</label>
          <input
            type="text"
            value={form.file_ref}
            onChange={(e) => onChange("file_ref", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </section>
  );
}