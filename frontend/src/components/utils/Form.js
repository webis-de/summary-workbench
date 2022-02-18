const Textarea = ({ rows, placeholder, onChange, value }) => (
  <textarea
    rows={rows}
    onChange={onChange}
    value={value}
    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
    placeholder={placeholder}
  />
);

export { Textarea };
