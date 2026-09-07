// report.service.js

// #libery import
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v7: uuidv7 } = require('uuid');
const path = require('path');
const fs = require('fs');
const nodemailer = require("nodemailer");

//  import funtion
const reportRepo = require("../repository/report.repositoy");
const { InvalidParameterError } = require("../../error/invalid-parameter.error");
const emailConfig = require("../../config/email.config"); // pastikan berisi email & password gmail

const getPaginationOffset = (page, limit) => {
  return (page - 1) * limit;
};


const getAll = async (req) => {
  const pageNumber = parseInt(req.body.batch, 10) || 1;
  const pageSize = parseInt(req.body.size, 10) || 10;

  const options = {
    offset: getPaginationOffset(pageNumber, pageSize),
    limit: pageSize,
  };

  const filter = {
    search: req.body.search?.trim() || undefined,
    status_delete: req.body.status_delete !== undefined ? req.body.status_delete : "1",
    report_id: req.body.report_id || undefined,
    status_acc: req.body.status_acc || undefined,
    report_inout: req.body.report_inout?.toLowerCase() || undefined,
    start_date: req.body.start_date || undefined,
    end_date: req.body.end_date || undefined,
    report_type_id: req.body.report_type_id || undefined,
  };

  const currentUserId = req.staff_id;
  const currentRoleId = req.role_id;
  const currentRoleName = req.role_name;

  // === Handle Admin ===
  if (currentRoleName === 'Admin') {
    // Admin bisa lihat semua laporan tanpa filter khusus
    delete filter.report_inout;
    delete filter.staff_id;
    delete filter.role_id;
  }

  // === Handle other roles ===
  else if (filter.report_inout === 'in') {
    if (currentRoleId === undefined || currentRoleId === null) {
      throw new Error('Role ID pengguna tidak ditemukan untuk filter "in".');
    }

    if (currentRoleName === 'Direktur') {
      filter.status_acc = 'disetujui';
      delete filter.role_id;
    } else if (currentRoleName === 'Manager') {
      filter.role_id = [currentRoleId + 1, currentRoleId + 2];
    } else {
      filter.role_id = currentRoleId + 1;
    }
  } else if (filter.report_inout === 'out') {
    if (currentUserId === undefined || currentUserId === null) {
      throw new Error('Staff ID pengguna tidak ditemukan untuk filter "out".');
    }
    filter.staff_id = currentUserId;
  }

  let data = [];
  let totalData = 0;

  try {
    data = await reportRepo.findAll(options, filter) || [];
  } catch (err) {
    console.error("Error fetching data:", err);
  }

  try {
    totalData = await reportRepo.count(filter);
  } catch (err) {
    console.error("Error counting data:", err);
  }

  const totalPages = Math.ceil(totalData / pageSize);

  return {
    page: {
      total_record_count: totalData,
      maxPage: totalPages,
      batch_number: pageNumber,
      raw_length: data.length,
      max_raw_size: pageSize,
    },
    records: Array.isArray(data) ? data : [],
  };
};



// 2. create report

const create = async (req) => {
  const detailIds = (req.body.details || []).map(() => uuidv7());

  try {
    if (!req.body.training_sesi_id || !req.body.report_schedule_id || !req.body.name) {
      throw new InvalidParameterError("Missing required fields");
    }

    const payload = {
      report_id: uuidv7(),
      training_sesi_id: req.body.training_sesi_id,
      report_schedule_id: req.body.report_schedule_id,
      staff_id: req.staff_id,
      name: req.body.name.trim(),
      author_acc: "-",
      status_acc: "menunggu",
      acc_director_by: "-",
      acc_director_status: "menunggu",
      details:
        Array.isArray(req.body.details) &&
        req.body.details.every(item =>
          item &&
          item.report_content_id &&
          item.content_text
        )
          ? req.body.details.map((item, index) => ({
              report_detail_id: detailIds[index] || "",
              report_content_id: item.report_content_id,
              content_text: item.content_text,
            }))
          : [],
      attachment: Array.isArray(req.body.attachment) ? req.body.attachment : [],
    };

    const createdReport = await reportRepo.create(payload);

    // Kirim email ke staff dengan role 2 dan 3
    const recipients = await reportRepo.findStaffByRoles([2, 3]); // return list of {email, name}

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailConfig.gmail.email,
        pass: emailConfig.gmail.password,
      },
    });

    const emailPromises = recipients.map((staff) =>
      transporter.sendMail({
        from: `"Training Report Notification" <${emailConfig.gmail.email}>`,
        to: staff.email,
        subject: "Laporan Baru Telah Dibuat",
        text: `Halo ${staff.name},\n\nSebuah laporan baru telah dibuat oleh staff dengan Nama: ${req.name}.\nJudul laporan: ${req.body.name}\n\nSilakan tinjau laporan tersebut di sistem.`,
      })
    );

    await Promise.all(emailPromises); // kirim semua email

    return createdReport;
  } catch (error) {
    throw new InvalidParameterError("Gagal input report: " + error.message);
  }
};


const update = async (req) => {
  try {
    const report_id = req.params.report_id;
    const isApprove = req.body.approve === true;
    const role = req.role_name;
    const staff_id = req.staff_id;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailConfig.gmail.email,
        pass: emailConfig.gmail.password,
      },
    });

    const sendNotification = async (toEmail, subject, text) => {
      await transporter.sendMail({
        from: `"Training Notification" <${emailConfig.gmail.email}>`,
        to: toEmail,
        subject,
        text,
      });
    };

    if (isApprove) {
      const accPayload = {};
      const report = await reportRepo.findById(report_id); // Ambil data laporan untuk akses staff_id pembuat

      if (!report) throw new InvalidParameterError("Report tidak ditemukan");

      if (['Manager', 'Supervisor'].includes(role)) {
        accPayload.status_acc = req.body.status_acc;
        accPayload.author_acc = staff_id;
        accPayload.role = role;

        const result = await reportRepo.updateAccStatus(report_id, accPayload, role);

        if (req.body.status_acc === 'ditolak') {
          const creator = await reportRepo.findStaffById(report.staff_id);
          if (creator) {
            await sendNotification(
              creator.email,
              "Laporan Ditolak oleh Atasan",
              `Laporan Anda dengan judul "${report.name}" telah ditolak oleh ${role}.`
            );
          }
        } else if (req.body.status_acc === 'disetujui') {
          const creator = await reportRepo.findStaffById(report.staff_id);
          const directors = await reportRepo.findStaffByRoles([1]);
          if (creator) {
            await sendNotification(
              creator.email,
              "Laporan Disetujui oleh Atasan",
              `Laporan Anda dengan judul "${report.name}" telah disetujui oleh ${role}. Menunggu persetujuan Direktur.`
            );
          }
          for (const director of directors) {
            await sendNotification(
              director.email,
              "Laporan Menunggu Persetujuan Direktur",
              `Laporan baru dari ${creator?.name || 'staff'} telah disetujui oleh ${role} dan menunggu persetujuan Anda.`
            );
          }
        }

        return result;

      } else if (role === 'Direktur') {
        accPayload.status_acc = req.body.status_acc;
        accPayload.author_acc = staff_id;
        accPayload.role = role;

        const result = await reportRepo.updateAccStatus(report_id, accPayload, role);

        const creator = await reportRepo.findStaffById(report.staff_id);
        if (creator) {
          const status = req.body.status_acc;
          await sendNotification(
            creator.email,
            `Laporan ${status === 'disetujui' ? 'Disetujui' : 'Ditolak'} oleh Direktur`,
            `Laporan Anda dengan judul "${report.name}" telah ${status} oleh Direktur.`
          );
        }

        return result;

      } else {
        throw new InvalidParameterError(`Role ${role} tidak berhak melakukan approve`);
      }
    }

    // Jika bukan approve, maka update data laporan
    const payload = {
      training_sesi_id: req.body.training_sesi_id,
      report_type_id: req.body.report_type_id,
      staff_id,
      name: req.body.name,
      start_time: req.body.start_time,
      finish_time: req.body.finish_time,
      details: req.body.details || [],
      attachment: Array.isArray(req.body.attachment) ? req.body.attachment : [],
    };

    const result = await reportRepo.update(report_id, payload);
    return result;

  } catch (error) {
    throw new InvalidParameterError("Gagal update report: " + error.message);
  }
};

// 4. update report
const softdelete = async (req) => {

    try{
        const report_id = req.params.report_id;
        const payload = {
            status_delete : 0
        };
    
        const result = await reportRepo.softdelete(report_id, payload);
        return result;
    } catch (error) {
        throw new InvalidParameterError("Gagal update report: " + error.message);
    }

};


module.exports = {
    getAll,
    create,
    update,
    softdelete,
};
