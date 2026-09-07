const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProgramTraining extends Model {
    static associate(models) {
      // Jika ada relasi ke Staff
      // this.hasMany(models.staff, {
      //   foreignKey: "role_id",
      //   as: "staffs",
      // });
    }
  }

  ProgramTraining.init(
    {
      program_training_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      alias: {
        type: DataTypes.STRING(4),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "program_training",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return ProgramTraining;
};
