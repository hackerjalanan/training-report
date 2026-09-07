// staff.service.js

// #libery import
const bcrypt = require("bcrypt");
const { v7: uuidv7 } = require('uuid');

// funtion import
const db = require('../../connection/mysql.connection'); 
const staffRepo = require("../repository/staff.repository");
const staffValid = require("../validation/staff.validation");
const { getMetadataInfo } = require('../../utility/metadata-info.utility'); 
const { getPaginationOffset } = require("../../utility/pagination.utility");
const { InvalidParameterError } = require("../../error/invalid-parameter.error");


// 1. created staf
const create = async (req) => {
  try {

    const {username, name, email, password, role_id } = req.body;

    // Cek dulu duplikat
    await staffValid.checkStaff(email, username); 

    const hashedPassword = await bcrypt.hash(password, 10);

    const staffPayload = {
      staff_id: uuidv7(), 
      username,
      name,
      email, 
      password: hashedPassword,
      role_id,
      status_deleted: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const newStaff = await staffRepo.createStaff(staffPayload);
    return newStaff;
  } catch (error) {
    throw new InvalidParameterError("Gagal membuat akun: " + error.message);
  }
};

// 2. showAll staff
const getAll = async (req) => {
  const pageNumber = parseInt(req.body.batch) || 1;
  const pageSize = parseInt(req.body.size) || 10;

  const options = {
    offset: getPaginationOffset(pageNumber, pageSize),
    limit: pageSize,
  };

  const filter = {
    search: req.body.search || "",
    status_deleted: req.body.status_deleted || "",
    role_id: req.body.role_id || "",
    staff_id: req.body.staff_id || "",
    limit: pageSize, // penting agar count bisa hitung maxPage dengan benar
  };

  const data = await staffRepo.findAll(options, filter); 
  const { totalCount, maxPage } = await staffRepo.count(filter); 

  return {
    records: data,
    page: {
      total_record_count:totalCount,
      maxPage: maxPage,
      batch_number: pageNumber,
      raw_length: data.length,
      max_raw_size: pageSize,
    },
  };
};

// 3. update staff
const update = async (req) => {
  const dataId = req.params.staff_id;
  const body = req.body;

  
  // set transaction
  const transaction = await db.sequelize.transaction();

  try {
      // get data 'modified_at' and 'modified_by'
      const { currentDatetime } = getMetadataInfo(req);
  
      const email = body.email;
      const username = body.username;
  
      const payload = {
          name: body.name,
          email,
          username,
          status_deleted:  body.status_deleted,
          role_id: body.role_id,
          updated_at: currentDatetime,
      };
      
      // Cek dulu duplikat
      await staffValid.checkStaff(email, username, dataId); 
  
      // update data by 'staff_id'
      await staffRepo.update(payload, { staff_id: dataId }, transaction);
  
      // commit transaction
      await transaction.commit();
  
      return payload;  

  } catch (error) {
    
      // rollback transaction
      await transaction.rollback();

      throw error;
  }
};

// 4. delete (soft-delete)
const softDelete = async (req) => {
  const dataId = req.params.staff_id;

   // set transaction
   const transaction = await db.sequelize.transaction();

  try {
      // get data 'modified_at' and 'modified_by'
      const { currentDatetime } = getMetadataInfo(req);
  
      const payload = {
          status_deleted: 0,
          updated_at: currentDatetime,
      };
  
      // update data by 'account_id'
      await staffRepo.update(payload, { staff_id: dataId }, transaction);
  
      // commit transaction
      await transaction.commit();

      return payload;    
  } catch (error) {
    throw new InvalidParameterError("Gagal delete akun: " + error.message);
  }
};

module.exports = {
  update,
  getAll,
  create,
  softDelete,
};
