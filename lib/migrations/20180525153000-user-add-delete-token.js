'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'deleteToken', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    }).catch(function (error) {
      if (error.message === 'SQLITE_ERROR: duplicate column name: deleteToken' || error.message === "ER_DUP_FIELDNAME: Duplicate column name 'alias'" || error.message === 'column "alias" of relation "Notes" already exists') {
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: function (queryInterface) {
    return queryInterface.removeColumn('Users', 'deleteToken')
  }
}
