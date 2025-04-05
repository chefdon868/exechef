const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Procurement extends Model {
    static associate(models) {
      // Define associations
      Procurement.belongsTo(models.Outlet, { foreignKey: 'outletId' });
    }
  }
  
  Procurement.init({
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
    itemCategory: {
      type: DataTypes.STRING,
      allowNull: true
    },
    itemDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Procurement',
    indexes: [
      {
        fields: ['outletId', 'date']
      }
    ]
  });
  
  return Procurement;
};
