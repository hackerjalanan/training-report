const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Attchment extends Model {
        static associate(models) {
 
            this.belongsTo(models.report, {
                foreignKey: 'report_id',
                as: 'report',
            });
        }
    }
  

  Attchment.init(
    {
      attachment_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      report_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },  
     
      status_delete: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "attachment",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Attchment;
};
