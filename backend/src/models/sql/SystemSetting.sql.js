const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const SystemSettingSQL = sequelize.define(
  'SystemSetting',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING(64),
      unique: true,
      defaultValue: 'global_settings',
    },
    siteName: {
      type: DataTypes.STRING(100),
      defaultValue: 'Job Workplace',
    },
    tagline: {
      type: DataTypes.STRING(255),
      defaultValue: 'Find Your Dream Career with AI Precision',
    },
    supportEmail: {
      type: DataTypes.STRING(120),
      defaultValue: 'support@jobworkplace.com',
    },
    contactPhone: {
      type: DataTypes.STRING(50),
      defaultValue: '+1 (800) 555-0199',
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    currencySymbol: {
      type: DataTypes.STRING(10),
      defaultValue: '$',
    },
    defaultTaxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 18,
    },
    taxName: {
      type: DataTypes.STRING(50),
      defaultValue: 'GST',
    },
    invoicePrefix: {
      type: DataTypes.STRING(30),
      defaultValue: 'JW-INV',
    },
    invoiceFooterNote: {
      type: DataTypes.TEXT,
      defaultValue: 'Thank you for choosing Job Workplace.',
    },
    stripeEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    razorpayEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    paypalEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    maintenanceMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    maintenanceMessage: {
      type: DataTypes.TEXT,
      defaultValue: 'Job Workplace is undergoing scheduled maintenance. We will be right back!',
    },
  },
  {
    tableName: 'system_settings',
    timestamps: true,
  }
);

module.exports = SystemSettingSQL;
