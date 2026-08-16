const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../../config/mysql');
const bcrypt = require('bcryptjs');

const PendingUserSQL = sequelize.define(
  'PendingUser',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('candidate', 'recruiter'),
      defaultValue: 'candidate',
    },
    otp: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'pending_users',
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

module.exports = PendingUserSQL;
