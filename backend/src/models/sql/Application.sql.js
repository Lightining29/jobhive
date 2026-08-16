const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const ApplicationSQL = sequelize.define(
  'Application',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    candidateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    resumeUrl: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    coverLetter: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    status: {
      type: DataTypes.ENUM('pending', 'shortlisted', 'interview', 'rejected', 'accepted', 'withdrawn'),
      defaultValue: 'pending',
    },
    interview: {
      type: DataTypes.JSON,
      defaultValue: { scheduled: false, date: null, mode: '', link: '', notes: '' },
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    appliedSource: {
      type: DataTypes.STRING(30),
      defaultValue: 'portal',
    },
  },
  {
    tableName: 'applications',
    timestamps: true,
  }
);

module.exports = ApplicationSQL;
