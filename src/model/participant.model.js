const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    static associate(models) {
      // relation training sesi
      this.hasMany(models.participant_training, {
        foreignKey: "participant_id",
        as: "participant_training",
      });
    }
  }

  Participant.init(
    {
      participant_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      agency: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      domicile: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      status_deleted: {
        type: DataTypes.TINYINT,
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
      modelName: "participant",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Participant;
};
