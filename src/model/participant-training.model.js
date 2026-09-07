const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ParticipantTraining extends Model {
    static associate(models) {
      // Jika ada relasi ke Staff
      this.belongsTo(models.participant, {
        foreignKey: "participant_id",
        as: "participant",
      });
      
      this.belongsTo(models.training_sesi, {
        foreignKey: "training_sesi_id",
        as: "training_sesi",
      });
    }
  }

  ParticipantTraining.init(
    {
      participant_training_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      participant_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
     
      training_sesi_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
     
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "participant_training",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return ParticipantTraining;
};
