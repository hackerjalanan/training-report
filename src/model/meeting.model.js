const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Meeting extends Model {
    static associate(models) {
      this.belongsTo(models.training_sesi, {
        foreignKey: "training_sesi_id",
        as: "training_sesi",
      });
      this.belongsTo(models.meeting, {
        foreignKey: "meeting_id",
        as: "meeting",
      });
    }
  }

  Meeting.init(
    {
      meeting_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      training_sesi_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
     
      name: {
        type: DataTypes.STRING(64),
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
      modelName: "meeting",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Meeting;
};
