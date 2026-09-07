// staff.repository.js

// import library
const { Op, Association } = require("sequelize"); 

// import function
const { QueryError } = require("../../error/query.error");
const errorFormat = require("../../utility/error-format");
const { NotFoundError } = require("../../error/not-found.error");
const {getPaginationOffset} = require("../../utility/pagination.utility")
// import model
const db = require("../../connection/mysql.connection");
const ReportType = db.report_type;
const ReportContent = db.report_content;
const ReportDetail = db.report_detail;
const Report = db.report;
const ReportSchedule = db.report_schedule;

// 1. create report content
const findByName = async (name) => {
  return await ReportType.findOne({ where: { name } });
};

// Buat ReportType
const create = async (payload, transaction = null) => {
  try {
    const config = {};
    if (transaction) config.transaction = transaction;

    const reportType = await ReportType.create(payload, config);
    return reportType;
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// Buat banyak ReportContent
const bulkCreateContent = async (payloads, transaction = null) => {
  try {
    const config = {};
    if (transaction) config.transaction = transaction;

    const contents = await ReportContent.bulkCreate(payloads, config);
    return contents;
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// 2. find all
const findAll = async (filter = {}) => {
  const search = filter.search?.trim() || '';
  const batch = parseInt(filter.batch) || 1;
  const size = parseInt(filter.size) || 10;
  const offset = getPaginationOffset(batch, size);

  const whereType = {};

  // Filter berdasarkan nama report type
  if (search) {
    whereType.name = { [Op.like]: `%${search}%` };
  }

  // Filter berdasarkan ID tertentu
  if (filter.report_type_id) {
    whereType.report_type_id = filter.report_type_id;
  }

  const types = await ReportType.findAll({
    where: whereType,
    order: [['report_type_id', 'ASC']],
  });

  const totalTypes = types.length;

  const results = await Promise.all(
    types.map(async (type) => {
      const { report_type_id } = type;

      // Cek apakah type sudah digunakan di table Report
      const usedTypeCount = await ReportSchedule.count({ where: { report_type_id } });
      const isUsedType = usedTypeCount > 0;

      // Ambil konten dengan pagination
      const { rows: contents } = await ReportContent.findAndCountAll({
        where: { report_type_id },
        offset,
        limit: size,
        order: [['created_at', 'DESC']],
      });

      // Tambahkan flag isUsedContent untuk tiap konten
      const contentsWithUsage = await Promise.all(
        contents.map(async (content) => {
          const usedContentCount = await ReportDetail.count({
            where: { report_content_id: content.report_content_id },
          });
          const isUsedContent = usedContentCount > 0;

          return {
            ...content.toJSON(),
            isUsedContent,
          };
        })
      );

      return {
        ...type.toJSON(),
        isUsedType,
        contents: contentsWithUsage,
      };
    })
  );

  return {
    count: totalTypes,
    data: results,
  };
};


// 4. find report content by id
const findById = async (id) => {
  try {
    return await ReportType.findOne({
      where: { report_type_id: id },
      include: [
        {
          model: ReportContent,
          as: "contents",
          required: false,
        },
      ],
    });
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new NotFoundError(errObj.metaData.message, errObj);
  }
};

const findAllByReportType = async (report_type_id) => {
  try {
    return await ReportContent.findAll({
      where: { report_type_id }
    });
  } catch (error) {
    throw new QueryError("Gagal mengambil data report content", error);
  }
};

// Cek apakah digunakan dalam report_detail
const checkUsageInReportDetail = async (report_content_id) => {
  try {
    const count = await ReportDetail.count({
      where: { report_content_id }
    });
    return count > 0;
  } catch (error) {
    throw new QueryError("Gagal memeriksa penggunaan di ReportDetail", error);
  }
};

// Hapus data berdasarkan ID (hard delete)
const deleteByReportType = async (report_type_id, transaction = null) => {
  try {
    const options = {
      where: { report_type_id }
    };
    if (transaction) options.transaction = transaction;

    return await ReportContent.destroy(options);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

const deleted = async (where, transaction = null) => {
  try {
    const options = { where };
    if (transaction) options.transaction = transaction;

    return await ReportType.destroy(options);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// Untuk ambil content by ID
const findContentById = async (report_content_id) => {
  try {
    return await ReportContent.findOne({ where: { report_content_id } });
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new NotFoundError(errObj.metaData.message, errObj);
  }
};

// Untuk update content
const updateContent = async (data = {}, where, transaction = null) => {
  try {
    const config = { where };
    if (transaction) config.transaction = transaction;

    return await ReportContent.update(data, config);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

const updateType = async (data = {}, where, transaction = null) => {
  try {
    const config = { where };
    if (transaction) config.transaction = transaction;

    return await ReportType.update(data, config);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

const deleteContentsByIds = async (ids = [], transaction = null) => {
  try {
    const config = {
      where: { report_content_id: ids }
    };
    if (transaction) config.transaction = transaction;

    return await ReportContent.destroy(config);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

const createContent = async (data = {}, transaction = null) => {
  try {
    const config = {};
    if (transaction) config.transaction = transaction;

    return await ReportContent.create(data, config);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

module.exports = {
  deleteByReportType,
  findContentById,
  findByName,
  findAll,
  updateType,
  createContent,
  deleteContentsByIds,
  bulkCreateContent,
  updateContent,
  deleted,
  create,
  findById,
  findAllByReportType,
  checkUsageInReportDetail
};