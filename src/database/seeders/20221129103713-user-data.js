'use strict';
const seedBuilder = require('../buildSeed.js');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash('ten9285ten', 5);
    return await seedBuilder.createSeed(
      queryInterface,
      'users',
      [
        {
          id: 1,
          fio: 'Admin',
          email: 'incloudff@gmail.com',
          phone: '79953276845',
          password: password,
          isActivatedEmail: true,
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
