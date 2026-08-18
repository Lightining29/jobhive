const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const PortfolioSQL = sequelize.define(
  'Portfolio',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      index: true,
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    theme: {
      type: DataTypes.ENUM('modern_tech', 'executive'),
      defaultValue: 'modern_tech',
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    themeSettings: {
      type: DataTypes.JSON,
      defaultValue: {
        accentColor: '#00f0ff',
        font: 'Plus Jakarta Sans',
        layout: 'standard',
      },
    },
    hero: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    about: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    skills: {
      type: DataTypes.JSON,
      defaultValue: { categories: [] },
    },
    experience: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    projects: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    education: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    certifications: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    achievements: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    services: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    seo: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    tableName: 'portfolios',
  }
);

module.exports = PortfolioSQL;
