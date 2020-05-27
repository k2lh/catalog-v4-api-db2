/**
 * A store of users by their uid.
 *
 * @type {Object<string: Object>}
 */
const UsersStore = {};

/**
 * A class that mocks a Users store and acts a Users model object. This stores all users by their
 * uid property which is their unique ID.
 *
 * @class
 */
class User {
  /**
   * Constructor function to create a new user.
   *
   * @param {Object} user The user object to create and save.
   * @constructor
   */
  constructor(user) {
    return this.constructor.save(user);
  }

  /**
   * Saves a new user to current Users store.
   *
   * @param {Object} user
   * @returns {Object} The user object that has just been added.
   */
  static save(user) {
    const { uid } = user;
    const currentUser = UsersStore[uid];

    if (currentUser) {
      console.warn(`User with id ${uid} already exists`);
      return currentUser;
    }

    return UsersStore[uid] = user;
  }

  /**
   * Searches current Users store for a user by a given unique identifier.
   *
   * @param {String} uid The unique ID of the user to get.
   * @returns {Object} The user object that corresponds to the found user.
   */
  static findById(uid) {
    if (!UsersStore[uid]) {
      return null;
    }

    return UsersStore[uid];
  }
}

module.exports = User;
