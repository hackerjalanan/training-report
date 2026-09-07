// report-content.service.js

const { v7: uuidv7 } = require('uuid');
const { InvalidParameterError } = require("../../error/invalid-parameter.error");
const { NotFoundError } = require("../../error/not-found.error");
const { QueryError } = require("../../error/query.error");
const { getMetadataInfo } = require('../../utility/metadata-info.utility');
const { getPaginationOffset } = require("../../utility/pagination.utility");
const db = require('../../connection/mysql.connection');
const reportTypeRepo = require("../repository/report-type.repository");

// 1. Create report content
const create = async (req) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { report_type_name, content_names } = req.body;

    if (!report_type_name || !Array.isArray(content_names) || content_names.length === 0) {
      throw new InvalidParameterError("report_type_name dan minimal satu content_name wajib diisi");
    }

    let reportType = await reportTypeRepo.findByName(report_type_name);
    if (!reportType) {
      const payload = {
        report_type_id: uuidv7(),
        name: report_type_name,
        created_at: new Date()
      };
      reportType = await reportTypeRepo.create(payload, transaction);
    }

    const contentPayloads = content_names.map(name => ({
      report_content_id: uuidv7(),
      report_type_id: reportType.report_type_id,
      content_name: name,
      created_at: new Date(),
      updated_at: new Date()
    }));

    const contents = await reportTypeRepo.bulkCreateContent(contentPayloads, transaction);
    await transaction.commit();

    return {
      message: "Report type dan content berhasil dibuat",
      data: { report_type: reportType, contents }
    };
  } catch (error) {
    await transaction.rollback();
    throw new InvalidParameterError("Gagal membuat report content: " + error.message);
  }
};

// 2. Show all
const showAll = async (req) => {
  try {
    const { report_type_id = '', search = '', batch = 1, size = 10 } = req.body;

    const offset = getPaginationOffset(batch, size);

    const result = await reportTypeRepo.findAll({
      search,
      report_type_id,
      batch: parseInt(batch),
      size: parseInt(size),
      offset,
      limit: parseInt(size)
    });

    return {
      records: result.data,
      pagination: {
        current_page: batch,
        page_size: size,
        total_items: result.count,
        total_pages: Math.ceil(result.count / size)
      }
    };
  } catch (error) {
    throw new InvalidParameterError('Gagal mengambil data report content: ' + error.message);
  }
};

// 3. Get by report_content_id
const getById = async (req) => {
  try {
    const { report_content_id } = req.params;

    if (!report_content_id) {
      throw new InvalidParameterError("report_content_id diperlukan");
    }

    const reportContent = await reportTypeRepo.findContentById(report_content_id);
    if (!reportContent) {
      throw new NotFoundError(`Report content dengan ID '${report_content_id}' tidak ditemukan`);
    }

    return {
      message: "Data report content berhasil ditemukan",
      data: reportContent
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new InvalidParameterError("Gagal mengambil data report content: " + error.message);
  }
};

// 4. Update content
const update = async (req) => {
  const { report_type_id } = req.params;
  const { report_type_name, contents } = req.body;
  const transaction = await db.sequelize.transaction();

  try {
    if (!report_type_id) {
      throw new InvalidParameterError("report_type_id wajib diisi");
    }

    const existingType = await reportTypeRepo.findById(report_type_id);
    if (!existingType) {
      throw new NotFoundError(`Report type dengan ID '${report_type_id}' tidak ditemukan`);
    }

    // Update nama report type jika ada
    if (report_type_name) {
      await reportTypeRepo.updateType(
        { name: report_type_name, updated_at: new Date() },
        { report_type_id },
        transaction
      );
    }

    const existingContents = await reportTypeRepo.findAllByReportType(report_type_id);
    const incomingIds = contents.map(c => c.report_content_id).filter(Boolean); // hanya ID yang valid

    // Hapus konten lama yang tidak ada di daftar baru
    const toDelete = existingContents.filter(c => !incomingIds.includes(c.report_content_id));
    if (toDelete.length > 0) {
      const toDeleteIds = toDelete.map(c => c.report_content_id);
      await reportTypeRepo.deleteContentsByIds(toDeleteIds, transaction);
    }

    // Proses konten baru dan lama
    const updatedContents = [];

    for (const content of contents) {
      let { report_content_id, content_name } = content;

      if (!content_name) {
        throw new InvalidParameterError("Tiap content wajib punya content_name");
      }

      if (!report_content_id) {
        // Buat UUID baru jika ID tidak dikirim
        report_content_id = uuidv7();

        await reportTypeRepo.createContent(
          {
            report_content_id,
            report_type_id,
            content_name,
            created_at: new Date(),
            updated_at: new Date()
          },
          transaction
        );
      } else {
        const existingContent = await reportTypeRepo.findContentById(report_content_id);
        if (existingContent) {
          await reportTypeRepo.updateContent(
            {
              content_name,
              updated_at: new Date()
            },
            { report_content_id },
            transaction
          );
        } else {
          await reportTypeRepo.createContent(
            {
              report_content_id,
              report_type_id,
              content_name,
              created_at: new Date(),
              updated_at: new Date()
            },
            transaction
          );
        }
      }

      updatedContents.push({ report_content_id, content_name });
    }

    await transaction.commit();
    return {
      message: "Report type dan konten berhasil diperbarui",
      data: {
        report_type_id,
        updated_type_name: report_type_name,
        updated_contents: updatedContents
      }
    };
  } catch (error) {
    await transaction.rollback();
    if (
      error instanceof NotFoundError ||
      error instanceof InvalidParameterError
    ) {
      throw error;
    }
    throw new QueryError("Gagal update data: " + error.message);
  }
};


// 5. Delete report type dan kontennya
const deleteReportTypeWithContents = async (req) => {
  const { report_type_id } = req.params;
  const transaction = await db.sequelize.transaction();

  try {
    const reportType = await reportTypeRepo.findById(report_type_id);
    if (!reportType) {
      throw new NotFoundError(`Report type dengan ID '${report_type_id}' tidak ditemukan`);
    }

    const contents = await reportTypeRepo.findAllByReportType(report_type_id);
    for (const content of contents) {
      const isUsed = await reportTypeRepo.checkUsageInReportDetail(content.report_content_id);
      if (isUsed) {
        throw new InvalidParameterError(`Content '${content.content_name}' sedang digunakan`);
      }
    }

    await reportTypeRepo.deleteByReportType(report_type_id, transaction);
    await reportTypeRepo.deleted({ report_type_id }, transaction);

    await transaction.commit();
    return { message: "Report type dan konten berhasil dihapus", data: { report_type_id } };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof NotFoundError || error instanceof InvalidParameterError) throw error;
    throw new InvalidParameterError("Gagal menghapus data: " + error.message);
  }
};

module.exports = {
  create,
  showAll,
  getById,
  update,
  deleteReportTypeWithContents,
};
