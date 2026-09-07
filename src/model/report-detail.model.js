const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReportDetail extends Model {
    static associate(models) {
      this.belongsTo(models.report_content, {
        foreignKey: 'report_content_id',
        as: 'content',
      });

      this.belongsTo(models.report, {
        foreignKey: 'report_id',
        as: 'report',
      });
    }
  }

  ReportDetail.init(
    {
      report_detail_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      report_content_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      report_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      content_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'report_detail',
      freezeTableName: true,
      timestamps: false,
    }
  );

  return ReportDetail;
};
