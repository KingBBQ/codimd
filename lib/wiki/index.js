'use strict'
// history
// external modules
var LZString = require('@hackmd/lz-string')

// core
var config = require('../config')
var logger = require('../logger')
var response = require('../response')
var models = require('../models')

// eslint-disable-next-line no-unused-vars
function pagesGet (req, res) {
  if (req.isAuthenticated()) {
    getPages(req.user.id, function (err, pages) {
      if (err) return response.errorInternalError(req, res)
      if (!pages) return response.errorNotFound(req, res)
      // console.log(pages[1])
      var data = []
      // var lastCat = ''
      var cat = ''
      for (var i = 0, l = pages.length; i < l; i++) {
        var page = pages[i]
        try {
          var newId = ''
          if (page.id && models.Note.checkNoteIdValid(page.id)) {
            newId = models.Note.encodeNoteId(page.id)
          }
        } catch (err) {
          // most error here comes from LZString, ignore
          if (err.message === 'Cannot read property \'charAt\' of undefined') {
            logger.warning('Looks like we can not decode "' + pages[i].id + '" with LZString. Can be ignored.')
          } else {
            logger.error(err)
          }
        }
        /*
        if (page.category != lastCat) {
          cat = ''
        } else {
          cat = page.category
        }
        lastCat = page.category
        */
        var description = ''
        var tags = ''
        try {
          description = models.Note.generateDescription(page.content)
        } catch (err) {
          // most error here comes from LZString, ignore
          if (err.message === 'Cannot read description') {
            logger.warning('Looks like we can not decode "' + pages[i].id + '" with LZString. Can be ignored.')
          } else {
            logger.error(err)
          }
        }
        try {
          tags = models.Note.parseNoteTags(page.content)
        } catch (err) {
          // most error here comes from LZString, ignore
          if (err.message === 'Cannot read tags') {
            logger.warning('Looks like we can not decode "' + pages[i].id + '" with LZString. Can be ignored.')
          } else {
            logger.error(err)
          }
        }

        data.push({
          id: newId,
          shortid: page.shortid,
          title: page.title,
          category: page.category,
          description: description,
          tags: tags
        })
      }

      res.send({
        pages: data
      })
    })
  } else {
    return response.errorForbidden(req, res)
  }
}

/*
.then(function (revisions) {
  var data = []
  for (var i = 0, l = revisions.length; i < l; i++) {
    var revision = revisions[i]
    data.push({
      time: moment(revision.createdAt).valueOf(),
      length: revision.length
    })
  }
  callback(null, data)
}) */
function getPages (userid, callback) {
  models.Note.findAll(
    {
      attributes: ['id', 'shortid', 'alias', 'permission', 'title', 'category', 'content'],
      order: [
        ['category', 'ASC'],
        ['title', 'ASC']
      ]
    /* where: {
      lastchangeuserId: userid
    } */
    }).then(function (notes) {
    if (!notes) {
      return callback(null, null)
    }
    if (config.debug) {
      logger.info('read wiki paces success: ' + notes.count)
    }
    return callback(null, notes)
  }).catch(function (err) {
    logger.error('read wiki pages failed: ' + err)
    return callback(err, null)
  })
}

function parseHistoryToArray (history) {
  var _history = []
  Object.keys(history).forEach(function (key) {
    var item = history[key]
    _history.push(item)
  })
  return _history
}

// public
exports.pagesGet = pagesGet
