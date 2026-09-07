const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReportType extends Model {
    static associate(models) {
      this.hasMany(models.report_content, {
        foreignKey: 'report_type_id',
        as: 'contents',
      });



      
    }
  }

  ReportType.init(
    {
      report_type_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
 
      created_at: {
        type: DataTypes.DATE,
        allowNull: false ,
      },
    },
    {
      sequelize,
      modelName: 'report_type',
      freezeTableName: true,
      timestamps: false,
    }
  );

  return ReportType;
};
