const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Revenue extends Model {
    static associate(models) {
      // Define associations
      Revenue.belongsTo(models.Outlet, { foreignKey: 'outletId' });
    }
  }
  
  Revenue.init({
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
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
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
    modelName: 'Revenue',
    indexes: [
      {
        unique: true,
        fields: ['outletId', 'date', 'category']
      }
    ]
  });
  
  return Revenue;
};
