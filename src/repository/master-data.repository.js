// import funtion
const { QueryError } = require('../../error/query.error');
const { NotFoundError } = require("../../error/not-found.error");

// import model
const db = require("../../connection/mysql.connection");
const Role = db.role;
const Staff = db.staff;
const Report = db.report;
const ReportType = db.report_type;
const TrainingSesi = db.training_sesi;
const ReportContent = db.report_content;
const ReportSchedule = db.report_schedule;
const ProgramTraining = db.program_training;


// 1. role - dropdwon
const getAllRoles = async () => {
  try {
    const roles = await Role.findAll();
    return roles;
  } catch (error) {
    throw new QueryError("Gagal mengambil data role: " + error.message);
  }
};


// 2. program training - dropdwon
const getAllProgramTraining = async (req) => {
  try {
    const id  = req.params.program_training_id;
    if (id) {
      const programtraining = await ProgramTraining.findByPk(id);
      if (!programtraining) {
        throw new NotFoundError(`Program training dengan ID ${id} tidak ditemukan.`);
      }
      return programtraining;
    } else {
      const programtrainings = await ProgramTraining.findAll({

        
      });
      return programtrainings;
    }
  } catch (error) {
    throw new QueryError("Gagal mengambil data program training: " + error.message);
  }
};


// 2. training sesi - dropdwon
const getAllTrainingSesi = async (staff_id) => {
  try {
    const data = await TrainingSesi.findAll({
     where: {
       // status_active:'active', 
      status_deleted:'1'
      } 
    });
    return data;
  } catch (error) {
    throw new QueryError("Gagal mengambil data sesi training: " + error.message);
  }
};


// 4. report type - dropdwon
const getAllReportType = async () => {
  try {
    const data = await ReportType.findAll({});
    return data;
  } catch (error) {
    throw new QueryError("Gagal mengambil data report type: " + error.message);
  }
};


// 5. report type - dropdwon
const getAllReportContent = async (reportTypeId) => {
  try {
    const contents = await ReportContent.findAll({
      where: { report_type_id: reportTypeId },
    });
    return contents;
  } catch (error) {
    console.error("Error fetching report contents:", error);
    throw new QueryError("Gagal mengambil data report content: " + error.message);
  }
};

// 6. training sesi - dropdwon
const getByIdStaff = async ({ staff_id, role_id }) => {
  try {
    const whereClause = {
      status_deleted: '1',
    };

    if (staff_id) {
      whereClause.staff_id = staff_id;
    }

    if (role_id) {
      whereClause.role_id = role_id;
    }

    const data = await Staff.findAll({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_id', 'name'],
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });

    return data;
  } catch (error) {
    throw new QueryError("Gagal mengambil data staff: " + error.message);
  }
};

// schedule training


// 1. training sesi - dropdwon
const getScheduleTrainingSesi = async (staff_id) => {
  try {
    const trainingSesiList = await TrainingSesi.findAll({
      where: {
        status_deleted: '1',
        staff_id
      }
    });

    if (!trainingSesiList || trainingSesiList.length === 0) {
      return [];
    }

    const filteredTrainingSesi = [];

    for (const trainingSesi of trainingSesiList) {
      const trainingSesiId = trainingSesi.training_sesi_id;

      // Hitung jumlah jadwal laporan (report schedule) untuk sesi ini
      const totalSchedules = await ReportSchedule.count({
        where: { training_sesi_id: trainingSesiId }
      });

      if (totalSchedules === 0) continue;

      // Hitung jumlah report yang sudah dibuat oleh staff untuk sesi ini
      const totalReports = await Report.count({
        where: {
          training_sesi_id: trainingSesiId,
          staff_id,
          status_delete: 1
        }
      });

      // Jika jumlah laporan < jumlah schedule → masih ada yang belum dilaporkan
      if (totalReports < totalSchedules) {
        filteredTrainingSesi.push(trainingSesi);
      }
    }

    return filteredTrainingSesi;

  } catch (error) {
    throw new QueryError("Gagal mengambil data sesi training: " + error.message);
  }
};

// 2. schedule report by training sesi id
const getReportScheduleByTrainingSesi = async (training_sesi_id) => {
  try {
    // Ambil semua report schedule berdasarkan training_sesi_id
    const reportScheduleList = await ReportSchedule.findAll({
      where: {
        training_sesi_id: training_sesi_id
      },
      include: [
        {
          model: ReportType, // Pastikan model ReportType sudah di-import
          as: 'report_type',
          attributes: ['report_type_id', 'name'] // Sesuaikan dengan field yang ada di report_type
        },
        {
          model: TrainingSesi, // Optional: jika ingin menampilkan info training sesi
          as: 'training_sesi',
          attributes: ['training_sesi_id', 'name'] // Sesuaikan dengan field yang ada
        }
      ]
    });

    // Jika tidak ada report schedule, return array kosong
    if (!reportScheduleList || reportScheduleList.length === 0) {
      return [];
    }

    // Filter report schedule yang belum ada di tb report
    const filteredReportSchedule = [];

    for (const schedule of reportScheduleList) {
      // Cek apakah schedule sudah ada di tb report untuk staff ini
      const existingReport = await Report.findOne({
        where: {
          report_schedule_id: schedule.report_schedule_id,
          status_delete: 1 // Pastikan report tidak terhapus
        }
      });

      // Jika belum ada report, tampilkan schedule
      // Jika sudah ada report, jangan tampilkan
      if (!existingReport) {
        filteredReportSchedule.push({
          report_schedule_id: schedule.report_schedule_id,
          training_sesi_id: schedule.training_sesi_id,
          report_type_id: schedule.report_type_id,
          report_type_name: schedule.report_type?.name || 'N/A',
          start_date: schedule.start_date,
          end_date: schedule.end_date,
          training_sesi_name: schedule.training_sesi?.name || 'N/A' // Optional
        });
      }
    }

    return filteredReportSchedule;

  } catch (error) {
    throw new QueryError("Gagal mengambil data report schedule: " + error.message);
  }
};



module.exports = {
  getAllRoles,
  getByIdStaff,
  getAllProgramTraining,
  getAllTrainingSesi,
  getAllReportType,
  getAllReportContent,


  getScheduleTrainingSesi,
  getReportScheduleByTrainingSesi,
};
