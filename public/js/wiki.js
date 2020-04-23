/* eslint-env browser, jquery */
/* global serverurl, moment */

import store from 'store'
import LZString from '@hackmd/lz-string'

import escapeHTML from 'lodash/escape'

import {
  checkNoteIdValid,
  encodeNoteId
} from './utils'

import { checkIfAuth } from './lib/common/login'

import { urlpath } from './lib/config'

window.migrateHistoryFromTempCallback = null

export function parseHistory (list, callback) {
  checkIfAuth(
    () => {
      parseServerToHistory(list, callback)
    },
    () => {
      parseStorageToHistory(list, callback)
    }
  )
}

export function parseServerToHistory (list, callback) {
  $.get(`${serverurl}/history`)
    .done(data => {
      if (data.history) {
        parseToHistory(list, data.history, callback)
      }
    })
    .fail((xhr, status, error) => {
      console.error(xhr.responseText)
    })
}

export function parseStorageToHistory (list, callback) {
  let data = store.get('notehistory')
  if (data) {
    if (typeof data === 'string') { data = JSON.parse(data) }
    parseToHistory(list, data, callback)
  }
  parseToHistory(list, [], callback)
}

function parseToHistory (list, notehistory, callback) {
  if (!callback) return
  else if (!list || !notehistory) callback(list, notehistory)
  else if (notehistory && notehistory.length > 0) {
    for (let i = 0; i < notehistory.length; i++) {
      // migrate LZString encoded id to base64url encoded id
      try {
        const id = LZString.decompressFromBase64(notehistory[i].id)
        if (id && checkNoteIdValid(id)) {
          notehistory[i].id = encodeNoteId(id)
        }
      } catch (err) {
        console.error(err)
      }
      // parse time to timestamp and fromNow
      const timestamp = (typeof notehistory[i].time === 'number' ? moment(notehistory[i].time) : moment(notehistory[i].time, 'MMMM Do YYYY, h:mm:ss a'))
      notehistory[i].timestamp = timestamp.valueOf()
      notehistory[i].fromNow = timestamp.fromNow()
      notehistory[i].time = timestamp.format('llll')
      // prevent XSS
      notehistory[i].text = escapeHTML(notehistory[i].text)
      notehistory[i].tags = (notehistory[i].tags && notehistory[i].tags.length > 0) ? escapeHTML(notehistory[i].tags).split(',') : []
      // add to list
      if (notehistory[i].id && list.get('id', notehistory[i].id).length === 0) { list.add(notehistory[i]) }
    }
  }
  callback(list, notehistory)
}

export function postHistoryToServer (noteId, data, callback) {
  $.post(`${serverurl}/history/${noteId}`, data)
    .done(result => callback(null, result))
    .fail((xhr, status, error) => {
      console.error(xhr.responseText)
      return callback(error, null)
    })
}

export function deleteServerHistory (noteId, callback) {
  $.ajax({
    url: `${serverurl}/history${noteId ? '/' + noteId : ''}`,
    type: 'DELETE'
  })
    .done(result => callback(null, result))
    .fail((xhr, status, error) => {
      console.error(xhr.responseText)
      return callback(error, null)
    })
}





export function parseWiki (list, callback) {
  checkIfAuth(
    () => {
      parseServerToWiki(list, callback)
    },
    () => {
      parseStorageToWiki(list, callback)
    }
  )
}

export function parseServerToWiki (list, callback) {
  $.get(`${serverurl}/wikiPages`)
    .done(data => {
      if (data.pages) {
        parseToWiki(list, data.pages, callback)
      }
    })
    .fail((xhr, status, error) => {
      console.error(xhr.responseText)
    })
}

export function parseStorageToWiki (list, callback) {
  let data = store.get('notehistory')
  if (data) {
    if (typeof data === 'string') { data = JSON.parse(data) }
    parseToHistory(list, data, callback)
  }
  parseToHistory(list, [], callback)
}

function parseToWiki (list, pages, callback) {
  console.log('parseToWiki...')
  if (!callback) return
  else if (!list || !pages) callback(list, pages)
  else if (pages && pages.length > 0) {
    for (let i = 0; i < pages.length; i++) {
      // migrate LZString encoded id to base64url encoded id
      try {
        const id = LZString.decompressFromBase64(pages[i].id)
        if (id && checkNoteIdValid(id)) {
          pages[i].id = encodeNoteId(id)
        }
      } catch (err) {
        console.error(err)
      }
      // parse time to timestamp and fromNow
      const timestamp = (typeof pages[i].time === 'number' ? moment(pages[i].time) : moment(pages[i].time, 'MMMM Do YYYY, h:mm:ss a'))
      pages[i].timestamp = timestamp.valueOf()
      pages[i].fromNow = timestamp.fromNow()
      pages[i].time = timestamp.format('llll')
      // prevent XSS
      pages[i].text = escapeHTML(pages[i].text)
      pages[i].tags = (pages[i].tags && pages[i].tags.length > 0) ? escapeHTML(pages[i].tags).split(',') : []
      // add to list
      // we dont work with the list, just with the pages and parse it manually
      //if (pages[i].id && list.get('id', pages[i].id).length === 0) { list.add(pages[i]) }
    }
    //list = pages
  }
  console.log('parseToWiki... calling the callback')
  callback(list, pages)
}
