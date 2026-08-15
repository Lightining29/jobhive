import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaSliders,
  FaBuilding,
  FaCreditCard,
  FaClock,
  FaShield,
  FaReceipt,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Job Workplace',
    tagline: 'Find Your Dream Career with AI Precision',
    supportEmail: 'support@jobworkplace.com',
    contactPhone: '+1 (800) 555-0199',
    currency: 'USD',
    currencySymbol: '$',
    defaultTaxRate: 18,
    taxName: 'GST',
    invoicePrefix: 'JW-INV',
    invoiceFooterNote: 'Thank you for choosing Job Workplace.',
    defaultTrialDays: 14,
    allowTrialExtensions: true,
    maxTrialExtensionDays: 30,
    requirePaymentForTrial: false,
    stripeEnabled: true,
    razorpayEnabled: true,
    paypalEnabled: false,
    jobAutoApproval: true,
    companyAutoVerification: false,
    candidateDefaultContactCredits: 5,
    employerDefaultJobCredits: 3,
    maintenanceMode: false,
    maintenanceMessage: 'Job Workplace is undergoing scheduled maintenance. We will be right back!',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.settings();
      if (data.settings) setSettings(data.settings);
    } catch (err) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast.success('System settings saved successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Platform & System Settings" subtitle="Global configuration for branding, currency, tax rates, free trials, and payment gateways" navItems={adminNavItems}>
      {loading ? (
        <div className="card p-8 skeleton h-96" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Branding */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-base text-ink flex items-center gap-2 border-b border-line pb-3">
              <FaBuilding className="text-primary-500" /> Platform & Brand Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Website Name</label>
                <input
                  value={settings.siteName || ''}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Tagline</label>
                <input
                  value={settings.tagline || ''}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail || ''}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Contact Phone</label>
                <input
                  value={settings.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Currency, Taxes & Invoices */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-base text-ink flex items-center gap-2 border-b border-line pb-3">
              <FaReceipt className="text-emerald-500" /> Currency, Taxes & Invoices
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Default Currency</label>
                <select
                  value={settings.currency || 'USD'}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="input text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Default Tax (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.defaultTaxRate || 0}
                  onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Tax Label</label>
                <input
                  value={settings.taxName || 'GST'}
                  onChange={(e) => setSettings({ ...settings, taxName: e.target.value })}
                  placeholder="GST / VAT / Sales Tax"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Invoice Prefix</label>
                <input
                  value={settings.invoicePrefix || 'JW-INV'}
                  onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                  className="input text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Global Free Trial Rules */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-base text-ink flex items-center gap-2 border-b border-line pb-3">
              <FaClock className="text-cyan-500" /> Global Free Trial Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Default Trial Days</label>
                <input
                  type="number"
                  min="1"
                  value={settings.defaultTrialDays || 14}
                  onChange={(e) => setSettings({ ...settings, defaultTrialDays: parseInt(e.target.value, 10) || 14 })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Max Trial Extension Days</label>
                <input
                  type="number"
                  min="1"
                  value={settings.maxTrialExtensionDays || 30}
                  onChange={(e) => setSettings({ ...settings, maxTrialExtensionDays: parseInt(e.target.value, 10) || 30 })}
                  className="input text-sm"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowTrialExtensions}
                    onChange={(e) => setSettings({ ...settings, allowTrialExtensions: e.target.checked })}
                    className="rounded border-line"
                  />
                  Allow Admin Trial Extensions
                </label>
              </div>
            </div>
          </div>

          {/* Payment Gateways & Maintenance */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-base text-ink flex items-center gap-2 border-b border-line pb-3">
              <FaCreditCard className="text-indigo-500" /> Payment Gateways & Platform Maintenance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 p-3 bg-surface-sunken/40 rounded-xl border border-line cursor-pointer text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={settings.stripeEnabled}
                  onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                  className="rounded border-line"
                />
                Stripe Payments Enabled
              </label>
              <label className="flex items-center gap-2 p-3 bg-surface-sunken/40 rounded-xl border border-line cursor-pointer text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={settings.razorpayEnabled}
                  onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                  className="rounded border-line"
                />
                Razorpay Payments Enabled
              </label>
              <label className="flex items-center gap-2 p-3 bg-surface-sunken/40 rounded-xl border border-line cursor-pointer text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={settings.jobAutoApproval}
                  onChange={(e) => setSettings({ ...settings, jobAutoApproval: e.target.checked })}
                  className="rounded border-line"
                />
                Auto-Approve Recruiter Jobs
              </label>
            </div>

            {/* Maintenance Mode */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-ink">Maintenance Mode</h4>
                  <p className="text-xs text-muted">Temporarily display a maintenance notice to public visitors</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="rounded border-line h-5 w-5 text-amber-600"
                />
              </div>
              {settings.maintenanceMode && (
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Maintenance Notice Message</label>
                  <input
                    value={settings.maintenanceMessage || ''}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    className="input text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary !py-2.5 !px-6 text-sm font-bold shadow-md">
              {saving ? 'Saving Changes...' : 'Save Global Settings'}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
