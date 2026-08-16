const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');
const bcrypt = require('bcryptjs');

const UserSQL = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('candidate', 'recruiter', 'admin'),
      defaultValue: 'candidate',
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    headline: {
      type: DataTypes.STRING(160),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    education: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    experience: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    certifications: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    socialLinks: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    resume: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    subscription: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    contactCredits: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

UserSQL.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = UserSQL;
