'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Notes', 'category', {
      type: Sequelize.STRING
    }).then(function () {
      return queryInterface.addIndex('Notes', ['category'], {
      })
    }).catch(function (error) {
      if (error.message === 'SQLITE_ERROR: duplicate column name: category' || error.message === "ER_DUP_FIELDNAME: Duplicate column name 'alias'" || error.message === 'column "alias" of relation "Notes" already exists') {
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Notes', 'category').then(function () {
      return queryInterface.removeIndex('Notes', ['category'])
    })
  }
};
