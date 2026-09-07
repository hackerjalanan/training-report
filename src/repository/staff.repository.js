// satff.repository.js

// inport libery
const { Op } = require("sequelize"); 

// import funtion
const errorFormat = require("../../utility/error-format");
const { QueryError } = require("../../error/query.error");

//import model
const db = require("../../connection/mysql.connection");  
const Staff = db.staff;
const Role = db.role;

// 1. create staff
const createStaff = async (payload, transaction = null) => {
  try {
    const config = {};
    if (transaction) config.transaction = transaction;

    const staff = await Staff.create(payload, config);
    return staff;
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// 2. get staff
const findAll = async (options = {}, filter = {}) => {
  try {
    const whereClause = {};

    // Filter status_deleted hanya jika valid
    if (filter.status_deleted !== undefined && filter.status_deleted !== null && filter.status_deleted !== '') {
      whereClause.status_deleted = filter.status_deleted;
    }
    
    // Filter role_id tetap dijalankan jika tersedia
    if (filter.role_id !== undefined && filter.role_id !== null && filter.role_id !== '') {
      whereClause.role_id = filter.role_id;
    }
    
    // detail staff_id tetap dijalankan jika tersedia
    if (filter.staff_id !== undefined && filter.staff_id !== null && filter.staff_id !== '') {
      whereClause.staff_id = filter.staff_id;
    }
    
    // Filter pencarian
    if (filter.search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${filter.search}%` } },
        { username: { [Op.like]: `%${filter.search}%` } },
        { email: { [Op.like]: `%${filter.search}%` } },
        // { '$role.name$': { [Op.like]: `%${filter.search}%` } },
      ];
    }
    // cari data staff
    const staffs = await Staff.findAll({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
      ...options,
    });

    return staffs;
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new ErrorQueryException(errObj.metaData.message, errObj);
  }
};

// 3. Menghitung jumlah total data untuk pagination
const count = async (filter = {}) => {
  try {
    const whereClause = {};

    // Filter status_deleted
    if (filter.status_deleted !== undefined && filter.status_deleted !== null && filter.status_deleted !== '') {
      whereClause.status_deleted = filter.status_deleted;
    }

    // Filter role_id
    if (filter.role_id !== undefined && filter.role_id !== null && filter.role_id !== '') {
      whereClause.role_id = filter.role_id;
    }

    // Filter staff_id
    if (filter.staff_id !== undefined && filter.staff_id !== null && filter.staff_id !== '') {
      whereClause.staff_id = filter.staff_id;
    }

    // Filter search
    if (filter.search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${filter.search}%` } },
        { username: { [Op.like]: `%${filter.search}%` } },
        { email: { [Op.like]: `%${filter.search}%` } },
      ];
    }

    const totalCount = await Staff.count({ where: whereClause });

    // Pastikan limit adalah angka valid
    const limit = Number(filter.limit) || 10;
    const maxPage = Math.ceil(totalCount / limit);

    return {
      totalCount,
      maxPage
    };
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// 4. update data staff
const update = async (data = {}, where, transaction = false) => {
  try {
      let config = {
          where: where
      };

      // set transaction
      if (transaction) config.transaction = transaction;

      return await Staff.update(data, config);
  } catch (error) {
      const errObj = await errorFormat.sequelizeDB(error);
      throw new ErrorQueryException(errObj.metaData.message, errObj);
  }
}

// 5. find email data staff
const findByEmail = async (email) => {
  return await Staff.findOne({
    where: {
      email: {
        [Op.eq]: email,
      },
      status_deleted: 1, // asumsi hanya data aktif
    },
  });
};

// 6. find username data staff
const findByUsername = async (username) => {
  return await Staff.findOne({
    where: {
      username: {
        [Op.eq]: username,
      },
      status_deleted: 1,
    },
  });
};

module.exports = {
  createStaff,
  findAll,
  count,
  update,
  findByEmail,
  findByUsername,
};
