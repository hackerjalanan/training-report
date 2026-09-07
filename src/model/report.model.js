const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      this.belongsTo(models.report_schedule, {
        foreignKey: 'report_schedule_id',
        as: 'report_schedule',
      });

      this.belongsTo(models.staff, {
        foreignKey: 'staff_id',
        as: 'staff',
      });
      this.belongsTo(models.staff, {
        foreignKey: 'author_acc',
        as: 'atasan',
      });
      this.belongsTo(models.staff, {
        foreignKey: 'acc_director_by',
        as: 'director',
      });

      this.belongsTo(models.training_sesi, {
        foreignKey: 'training_sesi_id',
        as: 'training_sesis',
      });

      this.hasMany(models.report_detail, {
        foreignKey: 'report_id',  
        as: 'details',
      });

      this.hasMany(models.attachment, {
        foreignKey: 'report_id',
        as: 'attachments',
      });

    }
  }

  Report.init(
    {
      report_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      training_sesi_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      report_schedule_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      staff_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      finish_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      author_acc: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      // supervisor/ manager
      status_acc: {
        type: DataTypes.ENUM('menunggu','disetujui','ditolak'),
        allowNull: false,
      },
      acc_director_by: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      acc_director_status: {
        type: DataTypes.ENUM('menunggu','disetujui','ditolak'),
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
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'report',
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Report;
};
