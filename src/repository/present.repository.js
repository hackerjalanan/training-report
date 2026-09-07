const { Op } = require("sequelize");


const db = require("../../connection/mysql.connection");
const participant = db.participant;
const participant_training = db.participant_training;
const training_sesi = db.training_sesi;
const meeting = db.meeting;
const present = db.present;

const { QueryError } = require('../../error/query.error');

// tampilkan perserta berdasarkan training sesi
const getParticipantsByTrainingSession = async (filter = {}) => {
  const {
    training_sesi_id,
    search = '',
  } = filter;

  if (!training_sesi_id) {
    throw new QueryError('training_sesi_id is required');
  }

  try {
    // Ambil semua pertemuan (meetings) dari training session
    const meetings = await meeting.findAll({
      where: { training_sesi_id },
      order: [['start_date', 'ASC']],
      attributes: ['meeting_id', 'name']
    });

    const meetingNames = meetings.map(m => m.name);
    const meetingIds = meetings.map(m => m.meeting_id);

    // Buat where condition untuk participant
    const participantWhere = {
      status_deleted: 1,
    };

    // Tambahkan pencarian jika ada keyword
    if (search.trim() !== '') {
      participantWhere[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { agency: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    // Ambil peserta berdasarkan participant_training dengan training_sesi_id
    const participants = await participant.findAll({
      where: participantWhere,
      include: [{
        model: participant_training,
        as: 'participant_training',
        where: { training_sesi_id }, // Filter berdasarkan training_sesi_id
        required: true  // INNER JOIN - hanya ambil peserta yang ada di training session ini
      }],
      attributes: ['participant_id', 'name', 'agency', 'email'],
      order: [['name', 'ASC']]
    });

    console.log("Participants found:", participants.length);
    console.log("Participant with training rel:", participants.map(p => ({
      id: p.participant_id,
      name: p.name,
      trainingRel: p.participant_training,
    })));

    const participantIds = participants.map(p => p.participant_id);

    // Ambil data presensi berdasarkan peserta dan meeting
    const presences = await present.findAll({
      where: {
        participant_id: { [Op.in]: participantIds },
        meeting_id: { [Op.in]: meetingIds }
      },
      attributes: ['participant_id', 'meeting_id', 'status_present']
    });

    // Mapping presensi
    const presenceMap = {};
    for (const presence of presences) {
      if (!presenceMap[presence.participant_id]) {
        presenceMap[presence.participant_id] = {};
      }
      presenceMap[presence.participant_id][presence.meeting_id] = presence.status_present;
    }

    // Format data peserta
    const participantData = participants.map(p => {
      const presenceList = [];
      let hadirCount = 0;

      for (const meetingId of meetingIds) {
        const status = presenceMap[p.participant_id]?.[meetingId] ?? '-'; // kalau undefined pakai '-'
        presenceList.push(status);
        if (status === 'hadir') hadirCount++;
      }

      const presentRate = meetingIds.length > 0
        ? Math.round((hadirCount / meetingIds.length) * 100)
        : 0;

      return {
        participant_id: p.participant_id,
        name: p.name,
        agency: p.agency,
        email: p.email,
        presences: presenceList,
        present_rate: `${presentRate}%`
      };
    });

    return {
      meetings: meetingNames,
      data: participantData
    };

  } catch (error) {
    console.error('Error in getParticipantsByTrainingSession:', error);
    throw new QueryError(`Failed to retrieve participants: ${error.message}`);
  }
};

//by meeting
const getParticipantsByMetingSession = async (filter = {}) => {
  const {
    training_sesi_id,
    meeting_id,
    search = '',
  } = filter;

  if (!training_sesi_id) {
    throw new QueryError('training_sesi_id is required');
  }

  if (!meeting_id) {
    throw new QueryError('meeting_id is required');
  }

  const participantWhere = {
    status_deleted: 1,
  };

  if (search.trim() !== '') {
    participantWhere[Op.or] = [
      { name: { [Op.like]: `%${search.trim()}%` } },
      { agency: { [Op.like]: `%${search.trim()}%` } }
    ];
  }

  try {
    // Get specific meeting
    const meetingData = await meeting.findOne({
      where: { 
        training_sesi_id,
        meeting_id 
      },
      attributes: ['meeting_id', 'name']
    });

    if (!meetingData) {
      return {
        meeting: "",
        data: []
      };
    }

    // PERBAIKAN: Hanya ambil peserta yang terdaftar di training sesi ini
    const participants = await participant.findAll({
      where: participantWhere,
      include: [{
        model: participant_training,
        as: 'participant_training',
        where: { training_sesi_id }, // Filter berdasarkan training_sesi_id
        required: true // UBAH dari false ke true agar hanya yang ada di participant_training
      }],
      attributes: ['participant_id', 'name', 'agency', 'email'],
      order: [['name', 'ASC']]
    });

    const participantIds = participants.map(p => p.participant_id);

    const presences = await present.findAll({
      where: {
        participant_id: { [Op.in]: participantIds },
        meeting_id: meeting_id
      },
      attributes: ['present_id', 'participant_id', 'meeting_id', 'status_present']
    });

    // Create presence map for easier lookup
    const presenceMap = {};
    for (const presence of presences) {
      presenceMap[presence.participant_id] = {
        status: presence.status_present,
        present_id: presence.present_id
      };
    }

    const participantData = participants.map(p => {
      const presenceObj = presenceMap[p.participant_id];
      
      return {
        participant_id: p.participant_id,
        name: p.name,
        agency: p.agency,
        email: p.email,
        presences: {
          status: presenceObj?.status ?? '-',
          present_id: presenceObj?.present_id ?? '-'
        }
      };
    });

    return {
      meeting: meetingData.name,
      data: participantData,
      filter_info: {
        meeting_id: meeting_id,
        training_sesi_id: training_sesi_id,
        total_participants: participantData.length
      }
    };

  } catch (error) {
    console.error('Error in getParticipantsByMeetingSession:', error);
    throw new QueryError(`Failed to retrieve participants: ${error.message}`);
  }
};

// ALTERNATIVE: If you want to create a separate function specifically for single meeting
const getParticipantsByMeeting = async (filter = {}) => {
  const {
    meeting_id,
    search = '',
  } = filter;

  if (!meeting_id) {
    throw new QueryError('meeting_id is required');
  }

  // Get meeting info and training_sesi_id
  const meetingInfo = await meeting.findByPk(meeting_id, {
    attributes: ['meeting_id', 'name', 'training_sesi_id']
  });

  if (!meetingInfo) {
    throw new NotFoundError('Meeting not found');
  }

  // Use existing function with meeting_id filter
  return await getParticipantsByTrainingSession({
    training_sesi_id: meetingInfo.training_sesi_id,
    meeting_id: meeting_id,
    search: search
  });
};

// CONTROLLER USAGE EXAMPLE
const handleGetParticipants = async (req, res) => {
  try {
    const result = await getParticipantsByTrainingSession(req);
    
    res.status(200).json({
      success: true,
      data: result,
      message: result.filter_info?.meeting_id_filter 
        ? 'Participants retrieved for specific meeting'
        : 'Participants retrieved for all meetings in training session'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// simpan
const findOneByMeetingAndParticipant = async (meeting_id, participant_id) => {
  return await present.findOne({
    where: { meeting_id, participant_id },
  });
};

const create = async (data) => {
  return await present.create(data);
};

const update = async (presentInstance, data) => {
  return await presentInstance.update(data);
};

const findByTrainingSession = async (training_sesi_id) => {
  return await meeting.findAll({
    where: { training_sesi_id },
    attributes: ['meeting_id', 'name', 'start_date', 'end_date'],
    order: [['start_date', 'ASC']],
  });
};


module.exports = {
  getParticipantsByTrainingSession,
  getParticipantsByMetingSession,
  findOneByMeetingAndParticipant,
  create,
  update,
  findByTrainingSession
};