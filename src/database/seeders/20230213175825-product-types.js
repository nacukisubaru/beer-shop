'use strict';
const seedBuilder = require('../buildSeed.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await seedBuilder.createSeed(
      queryInterface,
      'product_types',
      [
        {
          id: 1,
          name: 'Пиво',
          code: 'beers'
        },
        {
          id: 2,
          name: 'Закуски',
          code: 'snacks'
        },
        {
          id: 3,
          name: 'Рыба',
          code: 'fish'
        },
      ],
      'id',
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
