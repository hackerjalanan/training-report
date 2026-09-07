const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TrainingSesi extends Model {
    static associate(models) {
      this.belongsTo(models.program_training, {
        foreignKey: "program_training_id",
        as: "program_training",
      });
      this.belongsTo(models.staff, {
        foreignKey: "staff_id",
        as: "staff",
      });
      this.hasMany(models.report, {
        foreignKey: "training_sesi_id",
        as: "reports",
      });
    }
  }

  TrainingSesi.init(
    {
      training_sesi_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      program_training_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      staff_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },

      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status_active: {
        type: DataTypes.ENUM("active", "no active", "finish"),
        allowNull: false,
      },
      meeting_mode: {
        type: DataTypes.ENUM("online", "offline"),
        allowNull: false,
      },
      status_deleted: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "training_sesi",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return TrainingSesi;
};
