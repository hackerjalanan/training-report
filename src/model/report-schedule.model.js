const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ReportSchedule extends Model {
    static associate(models) {
      this.belongsTo(models.training_sesi, {
        foreignKey: "training_sesi_id",
        as: "training_sesi",
      });

      this.belongsTo(models.report_type, {
        foreignKey: "report_type_id",
        as: "report_type",
      });

      this.hasMany(models.report, {
        foreignKey: 'report_schedule_id',
        as: 'reports',
      });

      this.belongsTo(models.meeting, {
        foreignKey: "meeting_id",
        as: "meeting",
      });


    }
  }

  ReportSchedule.init(
    {
      report_schedule_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      training_sesi_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      report_type_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
       meeting_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "report_schedule",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return ReportSchedule;
};
