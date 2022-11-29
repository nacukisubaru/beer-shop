'use strict';

const { Op } = require("sequelize");

const createSeed = async (queryInterface, modelName, bulk, findField) => {
    if(findField) {
        const updBulk = [];
        const addBulk = [];
        const allQueries = await bulk.map((item) => {
            const filter = { where: {} };
            filter.where[findField] = item[findField];
            return queryInterface.rawSelect(modelName, filter, ['id']);
        });
        
        const allIds = await Promise.all(allQueries);
        bulk.map((item) => {
            if(allIds.includes(item.id)) { 
                updBulk.push(item);
            } else {
                addBulk.push(item);
            }
        });

        if(updBulk.length && allIds.length) {
            const updQueries = await updBulk.map((item) => {
                return queryInterface.bulkUpdate(modelName, item, {id: item.id})
            });
            
            await Promise.all(updQueries);
        }

        if(addBulk.length) {
            return queryInterface.bulkInsert(modelName, addBulk);
        }
    }
}

module.exports = {
    createSeed
};