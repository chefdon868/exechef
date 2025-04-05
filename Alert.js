const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Alert extends Model {
    static associate(models) {
      // Define associations
      Alert.belongsTo(models.Outlet, { foreignKey: 'outletId' });
    }
  }
  
  Alert.init({
    outletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Outlets',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    actualPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    targetPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    variance: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('WITHIN TARGET', 'OVER TARGET'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Alert',
    indexes: [
      {
        fields: ['outletId', 'date']
      }
    ]
  });
  
  return Alert;
};
