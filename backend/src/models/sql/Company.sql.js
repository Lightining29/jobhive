const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');

const CompanySQL = sequelize.define(
  'Company',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(120),
      unique: true,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    logo: {
      type: DataTypes.JSON,
      defaultValue: { url: '', publicId: '' },
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    industry: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    size: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    foundedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    headquarters: {
      type: DataTypes.STRING(150),
      defaultValue: '',
    },
    country: {
      type: DataTypes.STRING(80),
      defaultValue: '',
    },
    city: {
      type: DataTypes.STRING(80),
      defaultValue: '',
    },
    email: {
      type: DataTypes.STRING(120),
      defaultValue: '',
    },
    phone: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    socialLinks: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    documents: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'companies',
    timestamps: true,
  }
);

module.exports = CompanySQL;
