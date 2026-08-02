import { motion } from 'framer-motion';
import { FaXmark, FaMagnifyingGlass } from 'react-icons/fa6';
import { EMPLOYMENT_LABELS, WORK_MODE_LABELS, capitalize } from '../../utils/format';

const CheckboxFilter = ({ label, checked, onChange, count }) => (
  <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-line text-primary focus:ring-primary focus:ring-offset-0 accent-primary-600"
    />
    <span className="text-sm text-ink group-hover:text-primary flex-1">{label}</span>
    {count !== undefined && <span className="text-xs text-muted">{count}</span>}
  </label>
);

const FilterSection = ({ title, children }) => (
  <div className="border-b border-line pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
    <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">{title}</h4>
    {children}
  </div>
);

const SidebarFilters = ({ filters, onChange, onClear, counts }) => {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const toggleArray = (key, value) => {
    const current = filters[key] || [];
    set(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const [workModes, employmentTypes] = [
    ['remote', 'hybrid', 'onsite'],
    ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
  ];

  return (
    <div className="card p-5 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <FaMagnifyingGlass className="h-4 w-4 text-primary" /> Filters
        </h3>
        <button onClick={onClear} className="text-xs font-medium text-muted hover:text-red-500 flex items-center gap-1">
          <FaXmark className="h-3 w-3" /> Clear
        </button>
      </div>

      <FilterSection title="Category">
        {['technical', 'non-technical'].map((c) => (
          <CheckboxFilter
            key={c}
            label={capitalize(c)}
            checked={filters.category === c}
            onChange={(v) => set('category', v ? c : '')}
            count={counts?.[c]}
          />
        ))}
      </FilterSection>

      <FilterSection title="Work Mode">
        {workModes.map((wm) => (
          <CheckboxFilter
            key={wm}
            label={WORK_MODE_LABELS[wm]}
            checked={(filters.workModes || []).includes(wm)}
            onChange={() => toggleArray('workModes', wm)}
            count={counts?.[wm]}
          />
        ))}
      </FilterSection>

      <FilterSection title="Employment Type">
        {employmentTypes.map((et) => (
          <CheckboxFilter
            key={et}
            label={EMPLOYMENT_LABELS[et]}
            checked={(filters.employmentTypes || []).includes(et)}
            onChange={() => toggleArray('employmentTypes', et)}
            count={counts?.[et]}
          />
        ))}
      </FilterSection>

      <FilterSection title="Experience">
        <select value={filters.experienceLevel || ''} onChange={(e) => set('experienceLevel', e.target.value)} className="input !py-2">
          <option value="">Any experience</option>
          <option value="internship">Internship</option>
          <option value="fresher">Fresher (0-2 yrs)</option>
          <option value="junior">Junior (1-3 yrs)</option>
          <option value="mid">Mid (3-6 yrs)</option>
          <option value="senior">Senior (5+ yrs)</option>
          <option value="lead">Lead (8+ yrs)</option>
        </select>
      </FilterSection>

      <FilterSection title="Minimum Salary">
        <select value={filters.salaryMin || ''} onChange={(e) => set('salaryMin', e.target.value)} className="input !py-2">
          <option value="">Any salary</option>
          <option value="50000">$50k+</option>
          <option value="80000">$80k+</option>
          <option value="100000">$100k+</option>
          <option value="120000">$120k+</option>
          <option value="150000">$150k+</option>
        </select>
      </FilterSection>

      <FilterSection title="Job Source">
        <select value={filters.source || ''} onChange={(e) => set('source', e.target.value)} className="input !py-2">
          <option value="">All sources</option>
          <option value="recruiter">Recruiter</option>
          <option value="jooble">Jooble</option>
          <option value="adzuna">Adzuna</option>
          <option value="arbeitnow">Arbeitnow</option>
          <option value="remotive">Remotive</option>
          <option value="muse">The Muse</option>
        </select>
      </FilterSection>

      <FilterSection title="Posted Within">
        <select value={filters.postedWithinDays || ''} onChange={(e) => set('postedWithinDays', e.target.value)} className="input !py-2">
          <option value="">Anytime</option>
          <option value="1">Today</option>
          <option value="3">Last 3 days</option>
          <option value="7">Last week</option>
          <option value="30">Last month</option>
        </select>
      </FilterSection>
    </div>
  );
};

export default SidebarFilters;
