const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');
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
      type: DataTypes.TEXT('long'),
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
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationOtp: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    verificationOtpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verificationToken: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    verificationTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
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
          if (
            typeof user.password === 'string' &&
            (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) &&
            user.password.length === 60
          ) {
            return;
          }
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

UserSQL.prototype.toSafeJSON = function () {
  const json = this.toJSON();
  json._id = String(json.id);
  delete json.password;
  delete json.verificationOtp;
  delete json.verificationOtpExpires;
  delete json.verificationToken;
  delete json.verificationTokenExpires;
  delete json.resetPasswordToken;
  delete json.resetPasswordExpires;
  return json;
};

module.exports = UserSQL;
