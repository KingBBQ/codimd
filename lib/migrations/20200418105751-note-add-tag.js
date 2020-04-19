'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Notes', 'tags', {
      type: Sequelize.STRING
    }).then(function () {
      return queryInterface.addIndex('Notes', ['tags'], {
      })
    }).catch(function (error) {
      if (error.message === 'SQLITE_ERROR: duplicate column name: tags' || error.message === "ER_DUP_FIELDNAME: Duplicate column name 'alias'" || error.message === 'column "alias" of relation "Notes" already exists') {
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('Notes', 'tags').then(function () {
      return queryInterface.removeIndex('Notes', ['tags'])
    })
  }

}
