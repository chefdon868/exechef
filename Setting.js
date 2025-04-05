const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {
      // Define associations
      Setting.belongsTo(models.Outlet, { foreignKey: 'outletId' });
    }
  }
  
  Setting.init({
    outletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Outlets',
        key: 'id'
      }
    },
    targetPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 25.00,
      validate: {
        isDecimal: true,
        min: 0,
        max: 100
      }
    },
    lowerThreshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1000.00,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    lowerAdjustment: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.10,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    upperThreshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 5000.00,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    upperAdjustment: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.95,
      validate: {
        isDecimal: true,
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Setting',
  });
  
  return Setting;
};
