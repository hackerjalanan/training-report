const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReportContent extends Model {
    static associate(models) {
      this.belongsTo(models.report_type, {
        foreignKey: 'report_type_id',
        as: 'report_type',
      });

      this.hasMany(models.report_detail, {
        foreignKey: 'report_content_id',
        as: 'details',
      });
    }
  }

  ReportContent.init(
    {
      report_content_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      report_type_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      content_name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false ,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false ,
      },
    },
    {
      sequelize,
      modelName: 'report_content',
      freezeTableName: true,
      timestamps: false ,
    }
  );

  return ReportContent;
};
