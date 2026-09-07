const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OtpVerify extends Model {
    static associate(models) {
      // Relasi ke staff
      this.belongsTo(models.staff, {
        foreignKey: "staff_id",
        as: "staff",
      });
    }
  }

  OtpVerify.init(
    {
      id_otp: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      staff_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      status: {
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
      modelName: "otp_verify",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return OtpVerify;
};
