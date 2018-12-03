const express = require('express');
const router = express.Router();
const {
    queryReminder,
    sendReminderSMS,
    ReminderToWord
} = require('../schema/reminder');

router.get('/items/:ss/:ee', queryReminder);

router.post('/sms', sendReminderSMS);

router.post('/:category/word', ReminderToWord);

module.exports = router;