const { validationRole } = require("./staff.middleware");

// Daftar role_id yang boleh akses halaman staff (misalnya admin dan HR)
const STAFF_ALLOWED_ROLES = [1, 2, 3, 4, 5]; // ganti sesuai role_id yang kamu tetapkan

// Middleware validasi + inject izin CRUD
const validationAllRole = validationRole(STAFF_ALLOWED_ROLES);

// 1. izin crud staff 
const injectStaffCrudPermission = (req, res, next) => {

  const roleId = req.role_id;

  const isDirektur = roleId === 1;
  const isManager = roleId === 2;
  const isSupervisor = roleId === 3;
  const isTrainer = roleId === 4;

  req.permission = {
    canCreate: isManager,
    canRead: isSupervisor || isManager || isDirektur,
    canUpdate: isManager,
    canDelete: isManager,
  };

  next();
};

// 2. izin sesi training
const injectSesiTrainingCrudPermission = (req, res, next) => {
  
  const roleId = req.role_id;

  const isDirektur = roleId === 1;
  const isManager = roleId === 2;
  const isSupervisor = roleId === 3;
  const isTrainer = roleId === 4;
  const isAdmin = roleId === 5;



  req.permission = {
    canCreate: isAdmin, 
    canRead: isSupervisor || isAdmin || isTrainer || isManager  || isDirektur ,
    canUpdate:  isAdmin, 
    canDelete:  isAdmin, 
    canPresent:  isTrainer, 
  };

  next();
};

// 3. izin participant 
const injectParticipantCrudPermission = (req, res, next) => {

  const roleId = req.role_id;

  const isDirektur = roleId === 1;
  const isManager = roleId === 2;
  const isSupervisor = roleId === 3;
  const isTrainer = roleId === 4;
  const isAdmin = roleId === 5;


  req.permission = {
    canCreate: isAdmin,
    canRead: isSupervisor || isManager || isDirektur || isTrainer || isAdmin,
    canUpdate:  isAdmin,
    canDelete:   isAdmin,
  };

  next();
};

// 3. izin participant 
const injectPresentPermission = (req, res, next) => {

  const roleId = req.role_id;

  const isDirektur = roleId === 1;
  const isManager = roleId === 2;
  const isSupervisor = roleId === 3;
  const isTrainer = roleId === 4;
  const isAdmin = roleId === 5;


  req.permission = {
    canCreate: isTrainer,
    canRead: isSupervisor || isManager || isDirektur || isTrainer || isAdmin,
    canUpdate:  isTrainer,
    canDelete:   isTrainer,
  };

  next();
};

// 4. izin report 
const injectReportCrudPermission = (req, res, next) => {

  const roleId = req.role_id;

  const isDirektur = roleId === 1;
  const isManager = roleId === 2;
  const isSupervisor = roleId === 3;
  const isTrainer = roleId === 4;
  const isAdmin = roleId === 5;


  req.permission = {
    canCreate:  isSupervisor || isTrainer,
    canRead: isSupervisor || isManager || isDirektur || isTrainer ||isAdmin,
    canUpdate:  isSupervisor || isTrainer,
    canDelete:  isSupervisor || isTrainer,
    canAprove:  isSupervisor || isManager ,
    canAproveDorektur: isDirektur,
  };

  next();
};

// 5. izin crud type report
const injectReportTypeCrudPermission = (req, res, next) => {

  const roleId = req.role_id;

  const isDirektur = roleId === 1;
  const isManager = roleId === 2;
  const isSupervisor = roleId === 3;
  const isTrainer = roleId === 4;
  const isAdmin = roleId === 5;

  req.permission = {
    canCreate: isSupervisor,
    canRead:  isAdmin || isManager || isSupervisor ,
    canUpdate: isSupervisor,
    canDelete: isSupervisor,
  };

  next();
};

// 6. jadwal report
const injectSesiReportScheduleCrudPermission = (req, res, next) => {
  
  const roleId = req.role_id;

  const isDirektur = roleId === 1;
  const isManager = roleId === 2;
  const isSupervisor = roleId === 3;
  const isTrainer = roleId === 4;
  const isAdmin = roleId === 5;



  req.permission = {
    canCreate: isSupervisor, 
    canRead: isSupervisor || isAdmin || isTrainer || isManager  || isDirektur ,
    canUpdate:  isSupervisor, 
    canDelete:  isSupervisor, 
    canPresent:  isTrainer, 
  };

  next();
};

module.exports = {
  validationAllRole,
  injectPresentPermission,
  injectStaffCrudPermission,
  injectReportCrudPermission,
  injectReportTypeCrudPermission,
  injectParticipantCrudPermission,
  injectSesiTrainingCrudPermission,
  injectSesiReportScheduleCrudPermission
};
