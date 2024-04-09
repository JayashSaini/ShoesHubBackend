const DB_NAME = 'ShoesHub';

const UserRolesEnum = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  SELLER: 'SELLER',
};
const AvailableUserRoles = Object.values(UserRolesEnum);

const UserLoginType = {
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
  GOOGLE: 'GOOGLE',
  GITHUB: 'GITHUB',
};
const AvailableSocialLogins = Object.values(UserLoginType);

const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes
module.exports = {
  DB_NAME,
  UserRolesEnum,
  AvailableUserRoles,
  UserLoginType,
  AvailableSocialLogins,
  USER_TEMPORARY_TOKEN_EXPIRY,
};
