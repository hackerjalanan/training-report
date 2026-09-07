const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    static associate(models) {
      // Relasi dengan Role
      this.belongsTo(models.role, {
        foreignKey: "role_id",
        as: "role",
      });

      // Relasi dengan Report (jika diperlukan)
      this.hasMany(models.otp_verify, {
        foreignKey: "id_otp",
        as: "otp_verify",
      });
    }
  }

  Staff.init(
    {
      staff_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(64),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(64),
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
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "staff",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Staff;
};
