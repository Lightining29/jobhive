const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const CardSQL = sequelize.define(
  'Card',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cardId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    personal: {
      type: DataTypes.JSON,
      defaultValue: {
        fullName: 'Alex Rivera',
        jobTitle: 'Senior Product Designer',
        department: 'Design & Experience',
        organization: 'JobHive Technologies',
        idNumber: 'JHV-9048',
        issueDate: '2024-01-15',
        validUntil: '2028-01-15',
        bloodGroup: 'O+',
        gender: 'Male',
        signatureText: 'Alex Rivera',
      },
    },
    contact: {
      type: DataTypes.JSON,
      defaultValue: {
        phone: '+1 (555) 349-2048',
        email: 'alex.rivera@jobhive.com',
        website: 'https://jobhive.app',
        address: '450 Corporate Plaza, Suite 400, New York, NY',
      },
    },
    media: {
      type: DataTypes.JSON,
      defaultValue: {
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        logoUrl: '',
        signatureUrl: '',
      },
    },
    design: {
      type: DataTypes.JSON,
      defaultValue: {
        themeId: 'clean-geometric-wedge',
        orientation: 'vertical',
        primaryColor: '#0b1d3a',
        accentColor: '#3b6fb6',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter',
        cardScale: 100,
        showBarcode: true,
        showQrCode: true,
        showPunchHole: true,
      },
    },
    security: {
      type: DataTypes.JSON,
      defaultValue: {
        barcodeNumber: '89845653208871',
        isVerified: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'revoked'),
      defaultValue: 'published',
    },
  },
  {
    tableName: 'cards',
    timestamps: true,
  }
);

module.exports = CardSQL;
