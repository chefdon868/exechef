const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Outlet extends Model {
    static associate(models) {
      // Define associations
      Outlet.hasMany(models.Revenue, { foreignKey: 'outletId' });
      Outlet.hasMany(models.Procurement, { foreignKey: 'outletId' });
      Outlet.hasOne(models.Setting, { foreignKey: 'outletId' });
    }
  }
  
  Outlet.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Outlet',
  });
  
  return Outlet;
};
