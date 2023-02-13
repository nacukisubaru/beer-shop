'use strict';
const seedBuilder = require('../buildSeed.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await seedBuilder.createSeed(
      queryInterface,
      'order-status',
      [
        {
          id: 1,
          statusName: 'Новый',
          status: 'new',
          color: '#03a9f4'
        },
        {
          id: 2,
          statusName: 'Взят в работу',
          status: 'in_work',
          color: 'blue'
        },
        {
          id: 3,
          statusName: 'Готов к выдаче',
          status: 'ready',
          color: '#ff5722'
        },
        {
          id: 4,
          statusName: 'Оплачен',
          status: 'payed',
          color: 'green'
        },
        {
          id: 5,
          statusName: 'Отменён',
          status: 'canceled',
          color: 'red'
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
