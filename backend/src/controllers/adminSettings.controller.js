const SystemSetting = require('../models/SystemSetting');
const asyncHandler = require('../utils/asyncHandler');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await SystemSetting.findOne({ key: 'global_settings' });
  if (!settings) {
    settings = await SystemSetting.create({ key: 'global_settings' });
  }
  res.json({ success: true, settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  let settings = await SystemSetting.findOne({ key: 'global_settings' });
  if (!settings) {
    settings = new SystemSetting({ key: 'global_settings' });
  }

  const allowedFields = [
    'siteName', 'siteLogo', 'tagline', 'supportEmail', 'contactPhone',
    'currency', 'currencySymbol', 'defaultTaxRate', 'taxName',
    'invoicePrefix', 'invoiceFooterNote', 'defaultTrialDays',
    'allowTrialExtensions', 'maxTrialExtensionDays', 'requirePaymentForTrial',
    'stripeEnabled', 'razorpayEnabled', 'paypalEnabled', 'currencyExchangeRates',
    'jobAutoApproval', 'companyAutoVerification',
    'candidateDefaultContactCredits', 'employerDefaultJobCredits',
    'maintenanceMode', 'maintenanceMessage',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  });

  await settings.save();
  res.json({ success: true, message: 'Settings updated successfully.', settings });
});

module.exports = {
  getSettings,
  updateSettings,
};
