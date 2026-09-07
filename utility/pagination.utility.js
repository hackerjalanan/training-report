const ErrorNotFoundException = require('../error/not-found.error').ErrorNotFoundException;

// 1 pagination 
const getPaginationOffset = (page, limit) => {
  return (page - 1) * limit;
};


// 2 total data 
const getPaginationTotalPages = (totalItems, pageSize) => {
  return Math.ceil(totalItems / pageSize);
};

// 3. format data 
const formatDate = (date) => {
  if (!date) return '-'; // Jika tanggal tidak valid, kembalikan "-"
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};



//format list laporan
function flattenedData (report,detailedThemes) {
  return{
  report_id: report.report_id,
  report_name: report.report_name,
  description: report.description,
  status_report: report.status_report,
  status: report.status,
  created_at: formatDate(report.created_at),
  updated_at: formatDate(report.updated_at),

  author_name: report.author?.name || "-",
  author_email: report.author?.email || "-",
  author_phone_number: report.author?.phone_number || "-",

  // Data dari relasi 'military_region' (relasi dalam 'author')
  author_military_region_name: report.author?.military_region?.name || "-",

  // Data dari relasi 'role' (relasi dalam 'author')
  author_role_name: report.author?.role?.name || "-",

  // Data dari relasi 'source_region'
  // source_region_id: report.source_region?.military_region_id || "-",
  source_region_name: report.source_region?.name || "-",

  // Data dari relasi 'target_region'
  target_region_id: report.target_region?.military_region_id || "-",
  target_region_name: report.target_region?.name || "-",
  target_region_alias: report.target_region?.alias || "-",

  // Data dari relasi 'report_sub_type'
  report_sub_type_id: report.report_sub_type?.sub_report_type_id || "-",
  report_sub_type_name: report.report_sub_type?.name || "-",

  // Data dari relasi 'report_type'
  report_type_id: report.report_type?.report_type_id || "-",
  report_type_name: report.report_type?.report_type_name || "-",

  details:detailedThemes,


  // Data dari relasi 'report_time_locations'
  locations: report.report_time_locations?.filter((location) => 
    location.latitude !== null && location.longitude !== null 
  ).map((location) => ({
    report_time_location_id: location.report_time_location_id,
    datetime_reported: formatDate(location.datetime_reported),
    location_description: location.location_description || "-",
    location_detail: location.location_detail || "-",
    latitude: location.latitude,
    longitude: location.longitude,
  })) || [],
}
};


//detail strukture respons
const mapDetailsToThemes = (details, reportThemes) => {
  try {
    if (!reportThemes || reportThemes.length === 0) {
      return { message: "Tidak ada tema yang ditemukan dalam detail laporan." };
    }

    // Map tema dari `reportThemes`
    const themeMap = {};
    reportThemes.forEach((theme) => {
      themeMap[theme.content_theme_id] = {
        content_theme_id: theme.content_theme_id,
        name: theme.report_theme_name,
        level: theme.level || "-",
        parentId: theme.parent?.toString() || "-", // Menggunakan tanda tanya jika parent ada
        created_at: new Date(theme.created_at), // Simpan dalam format Date untuk pengurutan
        content_text: "-", // Placeholder, akan diisi dari details
        children: [],
      };
    });

    // Gabungkan data `details` ke dalam tema (untuk isi konten)
    details.forEach((detail) => {
      if (themeMap[detail.content_theme_id]) {
        themeMap[detail.content_theme_id].content_text = detail.content_text || "-";
      }
    });

    // Hubungkan parent dengan children (manual berdasarkan `parentId`)
    const hierarchy = [];
    Object.values(themeMap).forEach((theme) => {
      if (theme.parentId && themeMap[theme.parentId] && theme.parentId !== "-") {
        // Jika memiliki parent, tambahkan ke children parent
        themeMap[theme.parentId].children.push(theme);
      } else if (theme.parentId === "-" || !theme.parentId) {
        // Jika tidak memiliki parent (parentId === "-"), tambahkan ke hierarki root
        hierarchy.push(theme);
      }
    });

    // Urutkan berdasarkan `created_at` (untuk root dan setiap tingkat hierarki)
    const sortHierarchy = (nodes) => {
      nodes.sort((a, b) => a.created_at - b.created_at); // Urutkan berdasarkan waktu yang lebih dulu
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortHierarchy(node.children); // Rekursif untuk mengurutkan anak-anak
        }
      });
    };

    sortHierarchy(hierarchy); // Urutkan hierarki utama

    // Hapus properti `children` yang kosong
    const removeEmptyChildren = (nodes) => {
      return nodes.map((node) => {
        const newNode = { ...node };
        if (newNode.children && newNode.children.length === 0) {
          delete newNode.children;
        } else if (newNode.children) {
          newNode.children = removeEmptyChildren(newNode.children);
        }
        return newNode;
      });
    };

    return removeEmptyChildren(hierarchy);
  } catch (error) {
    console.error("Error mapping details to themes:", error.message);
    throw new ErrorNotFoundException(`Gagal memetakan detail tema: ${error.message}`);
  }
};



module.exports = {
  mapDetailsToThemes,
  flattenedData,
  formatDate,
  getPaginationOffset,
  getPaginationTotalPages,
};
