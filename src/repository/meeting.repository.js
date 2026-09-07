// meeting.repository.js - Fixed for the Meeting model
const { QueryError } = require("../../error/query.error");
const { Op } = require("sequelize"); 

const db = require("../../connection/mysql.connection");
const Meeting = db.meeting;

const create = async (data, transaction = null) => {
  try {
    return await Meeting.create(data, { transaction });
  } catch (error) {
    console.error('Error in meeting create:', error);
    throw new QueryError(`Failed to create meeting: ${error.message}`);
  }
};

const findById = async (id) => {
  try {
    const data = await Meeting.findOne({
      where: { meeting_id: id },
      include: [
        {
          model: db.training_sesi,
          as: 'training_sesi',
          required: false
        }
      ]
    });
    return data;
  } catch (error) {
    console.error('Error in meeting findById:', error);
    throw new QueryError(`Failed to find meeting: ${error.message}`);
  }
};

const findAll = async (filter = {}) => {
  const {
    meeting_id,
    search = '',
    batch = 1,
    size = 5,
    training_sesi_id,
  } = filter;

  const where = {};

  // Filter spesifik
  if (meeting_id) {
    where.meeting_id = meeting_id;
  }

  if (training_sesi_id) {
    where.training_sesi_id = training_sesi_id;
  }

  // Fitur search pada kolom name
  if (search.trim() !== '') {
    where[Op.or] = [
      { name: { [Op.like]: `%${search.trim()}%` } }
    ];
  }

  const offset = (batch - 1) * size;

  try {
    const totalCount = await Meeting.count({ where });

    const meetings = await Meeting.findAll({
      where,
      include: [
        {
          model: db.training_sesi,
          as: 'training_sesi',
          required: false
        }
      ],
      limit: size,
      offset,
      order: [['created_at', 'DESC']],
    });

    const maxPage = Math.ceil(totalCount / size);

    return {
      page: {
        total_record_count: totalCount,
        maxPage,
        batch_number: batch,
        raw_length: meetings.length,
        max_raw_size: size
      },
      records: meetings
    };

  } catch (error) {
    console.error('Error in meeting findAll:', error);
    throw new QueryError(`Failed to retrieve meetings: ${error.message}`);
  }
};

const update = async (data, condition, transaction = null) => {
  try {
    const [affectedRows] = await Meeting.update(data, {
      where: condition,
      transaction,
    });

    return affectedRows;
  } catch (error) {
    console.error('Error in meeting update:', error);
    throw new QueryError(`Failed to update meeting: ${error.message}`);
  }
};

const destroy = async (id, transaction = null) => {
  try {
    const deletedRows = await Meeting.destroy({
      where: { meeting_id: id },
      transaction,
    });
    return deletedRows;
  } catch (error) {
    console.error('Error in meeting destroy:', error);
    throw new QueryError(`Failed to delete meeting: ${error.message}`);
  }
};

module.exports = {
  create,
  findById,
  findAll,
  update,
  destroy,
};