const { formatDate } = require('../../utility/pagination.utility');
const dashboardRepository = require('../repository/dashboard.repository');
const { NotFoundError } = require("../../error/not-found.error");

// 1. get activity
const getRecentActivityLogs = async () => {
  try {
    const { recentReports, recentParticipants } = await dashboardRepository.getRecentActivities(7);

    const logs = [];

    // 🔹 Tambahkan aktivitas dari laporan
    for (const rpt of recentReports) {
      const statusManager = rpt.status_acc;
      const statusDirektur = rpt.acc_director_status;

      const isFinished =
        statusManager === 'disetujui' &&
        statusDirektur === 'disetujui' &&
        new Date(rpt.finish_time) < new Date();

      const reportTypeName = rpt.report_schedule?.report_type?.name || 'Tipe Laporan Tidak Diketahui';
      const pelatihanName = rpt.training_sesis?.name || 'Pelatihan Tidak Diketahui';
      const staffName = rpt.staff?.name || 'Staf Tidak Diketahui';

      const message = isFinished
        ? `✅ Laporan "${reportTypeName}" oleh ${staffName} untuk pelatihan "${pelatihanName}" telah diselesaikan`
        : `📝 Laporan "${reportTypeName}" oleh ${staffName} untuk pelatihan "${pelatihanName}" telah dibuat`;

      logs.push({
        message,
        created_at: rpt.created_at,
        type: 'report'
      });
    }

    // 🔹 Tambahkan aktivitas peserta baru
    for (const p of recentParticipants) {
      const pelatihanName = p.training_sesi?.name || 'Pelatihan Tidak Diketahui';

      logs.push({
        message: `👥 Peserta baru ditambahkan ke pelatihan "${pelatihanName}"`,
        created_at: p.created_at,
        type: 'participant'
      });
    }

    // 🔄 Urutkan berdasarkan waktu terbaru
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return logs;
  } catch (error) {
    console.error(error);
    throw new NotFoundError("Gagal mengambil aktivitas terbaru");
  }
};


// 2. total dashboard
const fetchPTList = async (req) => {
  try {

    const roleId = req.role_id
    const staffId = req.staff_id
    const data = await dashboardRepository.getTrainingSummary(roleId, staffId);

    return  data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

// 3. grafik total training
const fetchTrainingGraph = async () => {
  try {
    const graphData = await dashboardRepository.getTrainingGraphData();

    // Struktur ulang data menjadi format mudah untuk chart
    const formattedData = {};

    graphData.forEach(item => {
      const label = `${item.year}-${item.month.toString().padStart(2, "0")}`;
      if (!formattedData[label]) {
        formattedData[label] = {
          label,
          active: 0,
          finish: 0,
          no_active: 0,
        };
      }

      if (item.status_active === "active") {
        formattedData[label].active = parseInt(item.total);
      } else if (item.status_active === "finish") {
        formattedData[label].finish = parseInt(item.total);
      } else if (item.status_active === "no active") {
        formattedData[label].no_active = parseInt(item.total);
      }
    });

    return Object.values(formattedData);
  } catch (error) {
    console.error("Gagal memuat data grafik training:", error);
    throw error;
  }
};

module.exports = {
  fetchPTList,
  fetchTrainingGraph,
  getRecentActivityLogs
};
