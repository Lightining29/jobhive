const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const JobSQL = sequelize.define(
  'Job',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jobId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    source: {
      type: DataTypes.STRING(50),
      defaultValue: 'recruiter',
    },
    companyName: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    companyLogo: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    companyWebsite: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    jobTitle: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    headline: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    description: {
      type: DataTypes.TEXT('long'),
      defaultValue: '',
    },
    requiredSkills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    category: {
      type: DataTypes.ENUM('technical', 'non-technical'),
      defaultValue: 'technical',
    },
    subCategory: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    experienceMin: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    experienceMax: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    experienceLevel: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    salary: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    salaryMin: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    salaryMax: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    salaryPeriod: {
      type: DataTypes.STRING(20),
      defaultValue: 'yearly',
    },
    employmentType: {
      type: DataTypes.STRING(50),
      defaultValue: 'full-time',
    },
    location: {
      type: DataTypes.STRING(150),
      defaultValue: '',
    },
    city: {
      type: DataTypes.STRING(80),
      defaultValue: '',
    },
    state: {
      type: DataTypes.STRING(80),
      defaultValue: '',
    },
    country: {
      type: DataTypes.STRING(80),
      defaultValue: '',
    },
    workMode: {
      type: DataTypes.STRING(30),
      defaultValue: 'onsite',
    },
    remote: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hybrid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    onsite: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    industry: {
      type: DataTypes.STRING(80),
      defaultValue: '',
    },
    postedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    applicationUrl: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    applicationEmail: {
      type: DataTypes.STRING(120),
      defaultValue: '',
    },
    postedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    trendingScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'jobs',
    timestamps: true,
  }
);

module.exports = JobSQL;
