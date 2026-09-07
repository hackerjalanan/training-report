const repository = require('../repository/present.repository');
const db = require("../../connection/mysql.connection");
const participant = db.participant;
const participant_training = db.participant_training;
const training_sesi = db.training_sesi;
const meeting = db.meeting;
const present = db.present;
const { QueryError } = require("sequelize");
const { NotFoundError } = require("../../error/not-found.error");
const { InvalidParameterError } = require("../../error/invalid-parameter.error");

const { v7: uuidv7 } = require('uuid');

const getParticipantsByTrainingSession = async (req) => {
  const {
    training_sesi_id,
    meeting_id,
    search,
  } = req.body;

  // Validasi input
  if (!training_sesi_id) {
    throw new InvalidParameterError("training_sesi_id is required");
  }

  // Validasi apakah training session exists
  const trainingSession = await db.training_sesi.findByPk(training_sesi_id);
  if (!trainingSession) {
    throw new NotFoundError("Training session not found");
  }

  const filters = {
    training_sesi_id,
    search,
  };

  return await repository.getParticipantsByTrainingSession(filters);
};

// SERVICE LAYER - Updated getParticipantsByTrainingSession
const getParticipantsByMeetingSession = async (req) => {
  const {
    training_sesi_id,
    meeting_id, // Added meeting_id filter
    search,
  } = req.body;

  // Validasi input
  if (!training_sesi_id) {
    throw new InvalidParameterError("training_sesi_id is required");
  }

  // Validasi apakah training session exists
  const trainingSession = await db.training_sesi.findByPk(training_sesi_id);
  if (!trainingSession) {
    throw new NotFoundError("Training session not found");
  }

  // Validasi meeting_id jika diberikan
  if (meeting_id) {
    const meetingExists = await db.meeting.findOne({
      where: {
        meeting_id,
        training_sesi_id // Pastikan meeting milik training session yang benar
      }
    });
    
    if (!meetingExists) {
      throw new NotFoundError("Meeting not found or doesn't belong to this training session");
    }
  }

  const filters = {
    training_sesi_id,
    meeting_id, // Pass meeting_id to repository
    search,
  };

  return await repository.getParticipantsByMetingSession(filters);
};


const create = async (req) => {
  const { meeting_id, participant_id, status_present } = req.body;

  if (!meeting_id || !participant_id || !status_present) {
    throw new QueryError('meeting_id, participant_id, and status_present are required');
  }

  // Cek apakah sudah ada presensi
  const existing = await repository.findOneByMeetingAndParticipant(meeting_id, participant_id);

  if (existing) {
    const updated = await repository.update(existing, { status_present });

    return {
      message: 'Presence updated successfully',
      present_id: updated.present_id,
      meeting_id,
      participant_id,
      status_present: updated.status_present,
    };
  }

  // Jika belum ada, create baru
  const created = await repository.create({
    present_id:uuidv7(), 
    meeting_id,
    participant_id,
    status_present,
    created_at : new Date(),
  });

  return {
    message: 'Presence created successfully',
    present_id: created.present_id,
    meeting_id,
    participant_id,
    status_present: created.status_present,
  };
};


const getDropdownMeeting = async (req) => {
  try {
    const { training_sesi_id } = req.body;

    if (!training_sesi_id) {
      throw new QueryError('training_sesi_id is required');
    }

    const meetings = await repository.findByTrainingSession(training_sesi_id);

    const formatted = meetings.map((m) => {
      const formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.toLocaleString('default', { month: 'short' });
        const year = String(d.getFullYear()).slice(-2);
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `${day}/${month}/${year} : ${time}`;
      };

      return {
        meeting_id: m.meeting_id,
        nama: `${m.name}, ${formatDate(m.start_date)} - ${formatDate(m.end_date)}`
      };
    });

    return formatted;
  } catch (error) {
    throw new QueryError(`Failed to get meeting dropdown: ${error.message}`);
  }
};

module.exports = {
  getParticipantsByTrainingSession,
  getParticipantsByMeetingSession,
  getParticipantsByMeetingSession,
  create,
  getDropdownMeeting,
};