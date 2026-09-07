// report.repositoy.js

// #inport libery
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v7: uuidv7 } = require('uuid');

// #import funtion
const errorFormat = require('../../utility/error-format');
const { QueryError } = require('../../error/query.error');

//import model
const db = require("../../connection/mysql.connection");
const report = db.report;
const staff = db.staff;
const report_type = db.report_type;
const report_schedule = db.report_schedule;
const report_content = db.report_content;
const report_detail= db.report_detail
const attachment = db.attachment
const present = db.present
const training_sesi = db.training_sesi
const role = db.role



// find and search
const findAll = async (options = {}, filter = {}) => {
  try {
    const whereClause = {};

    if (filter.status_delete !== undefined && filter.status_delete !== '') {
      whereClause.status_delete = filter.status_delete;
    }

    if (filter.report_id) {
      whereClause.report_id = filter.report_id;
    }

    if (filter.report_schedule_id) {
      whereClause.report_schedule_id = filter.report_schedule_id;
    }

    if (filter.staff_id) {
      whereClause.staff_id = filter.staff_id;
    }

    if (filter.start_date && filter.end_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(filter.start_date), new Date(filter.end_date)],
      };
    } else if (filter.start_date) {
      whereClause.created_at = {
        [Op.gte]: new Date(filter.start_date),
      };
    } else if (filter.end_date) {
      whereClause.created_at = {
        [Op.lte]: new Date(filter.end_date),
      };
    }


    // Handle role-based filtering - support both single role_id and array of role_ids
    if (filter.role_id) {
      if (Array.isArray(filter.role_id)) {
        // Handle multiple role IDs (e.g., Manager viewing Supervisor and Trainer reports)
        const allStaffIds = [];
        
        for (const roleId of filter.role_id) {
          const staffs = await staff.findAll({
            where: { role_id: roleId },
            attributes: ['staff_id'],
          });
          const staffIds = staffs.map(s => s.staff_id);
          allStaffIds.push(...staffIds);
        }
        
        whereClause.staff_id = { [Op.in]: allStaffIds.length > 0 ? allStaffIds : [0] };
      } else {
        // Handle single role ID (existing logic)
        const staffs = await staff.findAll({
          where: { role_id: filter.role_id },
          attributes: ['staff_id'],
        });

        const staffIds = staffs.map(s => s.staff_id);
        whereClause.staff_id = { [Op.in]: staffIds.length > 0 ? staffIds : [0] };
      }
    }

    if (filter.status_acc) {
      whereClause.status_acc = filter.status_acc;
    }

    if (filter.acc_director_status) {
      whereClause.acc_director_status = filter.acc_director_status;
    }

    // Search logic - updated to match model associations
    if (filter.search) {
      const searchTerm = `%${filter.search}%`;
      whereClause[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { '$details.content.content_name$': { [Op.like]: searchTerm } },
        { '$staff.name$': { [Op.like]: searchTerm } },
      ];
    }

    // Step 1: get report IDs with includes for search functionality
    const reportsOnly = await report.findAll({
      where: whereClause,
      attributes: ['report_id'],
      include: filter.search ? [
        {
          model: staff,
          as: 'staff',
          attributes: [],
          required: false,
        },
        {
          model: report_schedule,
          as: 'report_schedule',
          attributes: [],
          required: false,
          
        },
        {
          model: report_detail,
          as: 'details',
          attributes: [],
          include: [
            {
              model: report_content,
              as: 'content',
              attributes: [],
              required: false,
            },
          ],
          required: false,
        },
      ] : [],
      offset: options.offset,
      limit: options.limit,
      order: [['created_at', 'DESC']],
      subQuery: false,
    });

    const reportIds = reportsOnly.map(r => r.report_id);

    if (reportIds.length === 0) return [];

    // Step 2: get full data
    const fullReports = await report.findAll({
      where: {
        report_id: { [Op.in]: reportIds }
      },
      include: [
        {
          model: staff,
          as: 'staff',
           attributes: ['staff_id', 'name','role_id'],
           include: [{
            model: role,
            as: 'role',
            attributes: ['role_id', 'name'],
            },
          ],
        },
        {
          model: staff,
          as: 'atasan',
          attributes: ['staff_id', 'name','role_id'],
           include: [{
            model: role,
            as: 'role',
            attributes: ['role_id', 'name'],
            },
          ],
        },
        {
          model: staff,
          as: 'director',
          attributes: ['staff_id', 'name','role_id'],
           include: [{
            model: role,
            as: 'role',
            attributes: ['role_id', 'name'],
            },
          ],
        },
        {
          model: report_schedule,
          as: 'report_schedule',
          attributes: ['report_schedule_id', 'report_type_id', 'meeting_id' ],
           include: [
            {
              model: report_type,
              as: 'report_type',
              attributes: [ 'report_type_id', 'name'],
            },
          ],
      
        },
        {
          model: report_detail,
          as: 'details',
          include: [
            {
              model: report_content,
              as: 'content',
              attributes: ['report_content_id', 'content_name'],
            },
          ],
        },
        {
          model: attachment,
          as: 'attachments',
        },
        {
          model: training_sesi,
          as: 'training_sesis',
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return fullReports;
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// Updated count method to handle multiple role IDs and match model
const count = async (filter = {}) => {
  try {
    const whereClause = {};

    if (filter.status_delete !== undefined && filter.status_delete !== '') {
      whereClause.status_delete = filter.status_delete;
    }

    if (filter.report_id) {
      whereClause.report_id = filter.report_id;
    }

    if (filter.staff_id) {
      whereClause.staff_id = filter.staff_id;
    }

    // Handle role-based filtering - support both single role_id and array of role_ids
    if (filter.role_id) {
      if (Array.isArray(filter.role_id)) {
        // Handle multiple role IDs (e.g., Manager viewing Supervisor and Trainer reports)
        const allStaffIds = [];
        
        for (const roleId of filter.role_id) {
          const staffs = await staff.findAll({
            where: { role_id: roleId },
            attributes: ['staff_id'],
          });
          const staffIds = staffs.map(s => s.staff_id);
          allStaffIds.push(...staffIds);
        }
        
        whereClause.staff_id = { [Op.in]: allStaffIds.length > 0 ? allStaffIds : [0] };
      } else {
        // Handle single role ID (existing logic)
        const staffs = await staff.findAll({
          where: { role_id: filter.role_id },
          attributes: ['staff_id'],
        });

        const staffIds = staffs.map(s => s.staff_id);
        whereClause.staff_id = { [Op.in]: staffIds.length > 0 ? staffIds : [0] };
      }
    }

    if (filter.report_schedule_id) {
      whereClause.report_schedule_id = filter.report_schedule_id;
    }

    if (filter.status_acc) {
      whereClause.status_acc = filter.status_acc;
    }

    if (filter.acc_director_status) {
      whereClause.acc_director_status = filter.acc_director_status;
    }

    // Search logic - updated to match model associations
    if (filter.search) {
      const searchTerm = `%${filter.search}%`;
      whereClause[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { '$details.content.content_name$': { [Op.like]: searchTerm } },
        { '$staff.name$': { [Op.like]: searchTerm } },
      ];
    }

    const total = await report.count({
      where: whereClause,
      include: [
        {
          model: staff,
          as: 'staff',
          attributes: [],
          required: false,
        },
        {
          model: report_schedule,
          as: 'report_schedule',
          attributes: [],
          required: false,
        },
        {
          model: report_detail,
          as: 'details',
          attributes: [],
          include: [
            {
              model: report_content,
              as: 'content',
              attributes: [],
              required: false,
            },
          ],
          required: false,
        },
      ],
      distinct: true,
      col: 'report_id',
      subQuery: false,
    });

    return total;
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// 2. create
const create = async (payload) => {
  const t = await db.sequelize.transaction();
  try {
    // Ambil data dari report_schedule untuk mendapatkan start_date dan end_date
    let scheduleData = null;
    if (payload.report_schedule_id) {
      scheduleData = await db.report_schedule.findOne({
        where: { report_schedule_id: payload.report_schedule_id },
        attributes: ['start_date', 'end_date'],
        transaction: t
      });
    }

    // 1. Simpan ke table report
    const newReport = await report.create({
      report_id: payload.report_id || uuidv7(),
      training_sesi_id: payload.training_sesi_id,
      report_schedule_id: payload.report_schedule_id,
      staff_id: payload.staff_id,
      name: payload.name.trim(),
      author_acc: payload.author_acc,
      acc_director_by: payload.acc_director_by,
      status_acc: payload.status_acc || 'menunggu',
      acc_director_status: payload.acc_director_status || 'menunggu',
      start_time: scheduleData?.start_date || payload.start_time, // Ambil dari schedule atau fallback ke payload
      finish_time: scheduleData?.end_date || payload.finish_time, // Ambil dari schedule atau fallback ke payload
      status_delete: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, { transaction: t });

    // 2. Simpan ke report_detail (jika ada)
    if (Array.isArray(payload.details) && payload.details.length > 0) {
      const detailPayload = payload.details.map(item => ({
        report_detail_id: item.report_detail_id || uuidv7(),
        report_id: newReport.report_id,
        report_content_id: item.report_content_id,
        content_text: item.content_text,
        created_at: new Date(),
      }));
      await report_detail.bulkCreate(detailPayload, { transaction: t });
    }

    // 3. Simpan attachment base64 ke file .txt
    if (Array.isArray(payload.attachment) && payload.attachment.length > 0) {
      for (const base64String of payload.attachment) {
        const attachmentId = uuidv7();
        const filePath = path.join(
          __dirname, '..', '..', 'public', 'attachment', `${attachmentId}.txt`
        );

        fs.writeFileSync(filePath, base64String, 'utf8');

        await db.attachment.create({
          attachment_id: attachmentId,
          report_id: newReport.report_id,
          status_delete: 1,
          created_at: new Date(),
        }, { transaction: t });
      }
    }

    await t.commit();
    return newReport;
  } catch (error) {
    await t.rollback();
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// 3. updated report
const update = async (report_id, payload) => {
  const t = await db.sequelize.transaction();
  try {
    // Ambil data report yang ada untuk cek status
    const existingReport = await report.findOne({ 
      where: { report_id }, 
      transaction: t 
    });

    if (!existingReport) {
      throw new Error('Report not found');
    }

    // Prepare payload untuk update
    let updatePayload = { ...payload };

    // Reset status jika sedang ditolak
    if (existingReport.status_acc === 'ditolak') {
      updatePayload.status_acc = 'menunggu';
    }
    if (existingReport.acc_director_status === 'ditolak') {
      updatePayload.acc_director_status = 'menunggu';
    }

    // 1. Update report utama
    await report.update(
      updatePayload,
      { where: { report_id }, transaction: t }
    );

    // 2. Hapus dan insert ulang report_detail
    await report_detail.destroy({ where: { report_id }, transaction: t });

    if (Array.isArray(payload.details) && payload.details.length > 0) {
      const details = payload.details.map(item => ({
        report_detail_id: item.report_detail_id || uuidv7(),
        report_id,
        report_content_id: item.report_content_id,
        content_text: item.content_text,
        created_at: new Date(),
      }));
      await report_detail.bulkCreate(details, { transaction: t });
    }

    // 3. Hapus attachment dari DB dan file sistem
    const oldAttachments = await db.attachment.findAll({ 
      where: { report_id }, 
      transaction: t 
    });
    
    for (const att of oldAttachments) {
      const filePath = path.join(__dirname, '..', '..', 'public', 'attachment', `${att.attachment_id}.txt`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // hapus file dari sistem
      }
    }

    await db.attachment.destroy({ where: { report_id }, transaction: t });

    if (Array.isArray(payload.attachment) && payload.attachment.length > 0) {
      for (const base64String of payload.attachment) {
        const attachmentId = uuidv7();
        const filePath = path.join(__dirname, '..', '..', 'public', 'attachment', `${attachmentId}.txt`);

        fs.writeFileSync(filePath, base64String, 'utf8');

        await db.attachment.create({
          attachment_id: attachmentId,
          report_id,
          status_delete: 1,
          created_at: new Date(),
        }, { transaction: t });
      }
    }

    await t.commit();
    return { report_id };
  } catch (error) {
    await t.rollback();
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// 4. update status acc laporan
const updateAccStatus = async (report_id, { status_acc, author_acc}, role_name ) => {
  const t = await db.sequelize.transaction();
  try {
    const now = new Date();
    let updateData = {};

    if (['Manager', 'Supervisor'].includes(role_name)) {
      updateData = {
        status_acc :status_acc,
        author_acc: author_acc,
        updated_at: now,
      };
    } else if (role_name === 'Direktur') {
      updateData = {
        acc_director_status: status_acc,
        acc_director_by: author_acc,
        updated_at: now,
      };
    } else {
      throw new Error(`Role '${role_name}' tidak memiliki akses untuk meng-ACC laporan`);
    }

    await report.update(updateData, {
      where: { report_id },
      transaction: t,
    });

    await t.commit();
    return { report_id, ...updateData };
  } catch (error) {
    await t.rollback();
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};


// 4. updated report
const softdelete = async (report_id, payload) => {
  const t = await db.sequelize.transaction();
  try {
    // 1. Update report utama (soft delete)
    await report.update(
      {
        ...payload,
      },
      { where: { report_id }, transaction: t }
    );

    // 2. Ambil semua attachment_id yang tercatat di DB
    const allAttachmentRecords = await db.attachment.findAll({ attributes: ['attachment_id'], transaction: t });
    const validAttachmentIds = allAttachmentRecords.map(item => item.attachment_id);

    // 3. Cek semua file di folder 'attachment'
    const attachmentDir = path.join(__dirname, '..', '..', 'public', 'attachment');
    const allFiles = fs.readdirSync(attachmentDir);

    for (const filename of allFiles) {
      const ext = path.extname(filename);
      const basename = path.basename(filename, ext); // Ini adalah attachment_id

      // Jika file bukan bagian dari attachment_id yang sah => hapus
      if (!validAttachmentIds.includes(basename)) {
        const filePath = path.join(attachmentDir, filename);
        fs.unlinkSync(filePath);
      }
    }

    await t.commit();
    return { report_id };
  } catch (error) {
    await t.rollback();
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

const findStaffByRoles = async (roles = []) => {
  return await staff.findAll({
    where: {
      role_id: roles,
      status_deleted: 1,
    },
    attributes: ["email", "name"],
  });
};


const findStaffById = async (staff_id) => {
  return await staff.findOne({
    where: { staff_id, status_deleted: 1 },
    attributes: ["email", "name"],
  });
};

const findById = async (report_id) => {
  return await report.findOne({
    where: { report_id, status_delete: 1 },

  });
};

module.exports = {
  findAll,
  findStaffByRoles,
  count,
  create,
  update,
  softdelete,
  updateAccStatus,
  findStaffById,
  findById
};
