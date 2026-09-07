const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Jika ada relasi ke Staff
      // this.hasMany(models.staff, {
      //   foreignKey: "role_id",
      //   as: "staffs",
      // });
    }
  }

  Role.init(
    {
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      alias: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "role",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Role;
};
