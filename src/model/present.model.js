const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Present extends Model {
        static associate(models) {
 
            this.belongsTo(models.report, {
                foreignKey: 'meeting_id',
                as: 'meeting',
            });
            this.belongsTo(models.participant, {
                foreignKey: 'participant_id',
                as: 'participant',
            });
        }
    }
  

  Present.init(
    {
      present_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      meeting_id : {
        type: DataTypes.STRING(36),
        allowNull: false,
      },  
      participant_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },  
      status_present: {
        type: DataTypes.ENUM('hadir', 'absen', 'izin'),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "present",
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Present;
};
