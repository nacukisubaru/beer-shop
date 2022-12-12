'use strict';
const seedBuilder = require('../buildSeed.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await seedBuilder.createSeed(
      queryInterface,
      'users_roles',
      [
        {
          id: 1,
          roleId: 1,
          userId: 1
        },
      ],
      'id',
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
