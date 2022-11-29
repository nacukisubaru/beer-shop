'use strict';
const seedBuilder = require('../buildSeed.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await seedBuilder.createSeed(
      queryInterface,
      'roles',
      [
        {
          id: 1,
          value: 'ADMIN',
          description: 'Super user all rules',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          value: 'USER',
          description: 'Client user no special rules',
          createdAt: new Date(),
          updatedAt: new Date(),
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
