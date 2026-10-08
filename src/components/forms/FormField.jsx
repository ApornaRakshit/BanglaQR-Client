export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  hint = "",
  disabled = false,
  options = [],
  rows = 3,
  icon: Icon = null,
  className = "",
  inputClassName = "",
  prefix = null,
  suffix = null,
  readOnly = false,
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={name}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 sm:text-xs"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {hint && !error && (
            <span className="text-[11px] text-slate-400 font-normal">{hint}</span>
          )}
        </div>
      )}

      <div className="relative rounded-xl">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Icon size={18} />
          </div>
        )}

        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-semibold text-slate-500">
            {prefix}
          </div>
        )}

        {type === "select" ? (
          <select
            id={name}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            disabled={disabled}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
              error ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
            } ${Icon ? "pl-10" : ""} ${prefix ? "pl-10" : ""} ${inputClassName}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value ?? opt} value={opt.value ?? opt}>
                {opt.label ?? opt}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            rows={rows}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
              error ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
            } ${inputClassName}`}
            {...props}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
              error ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
            } ${Icon ? "pl-10" : ""} ${prefix ? "pl-12" : ""} ${suffix ? "pr-12" : ""} ${inputClassName}`}
            {...props}
          />
        )}

        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-semibold text-slate-400">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 animate-fadeIn">{error}</p>
      )}
    </div>
  );
}

