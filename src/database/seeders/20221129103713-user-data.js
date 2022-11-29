'use strict';
const seedBuilder = require('../buildSeed.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await seedBuilder.createSeed(
      queryInterface,
      'users',
      [
        {
          id: 1,
          name: 'Admin',
          surname: 'Admin',
          email: 'incloudff@gmail.com',
          phone: '79953276845',
          password: 'ten9285ten',
          isActivated: true,
          activationLink: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      'id',
    );
  },

  async down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('users', { id: 1 }, { id: 1 });
  },
};
