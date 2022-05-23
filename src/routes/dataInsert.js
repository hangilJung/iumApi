const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const logger = require('../config/logger')
const headerErrorCode = require('../headerErrorCode')

router.post('/', async (req, res) => {
    logger.info('/insert access')
    const { place_id, precipitation, water_level, temperature, humidity } = req.body.dataList
    let response = {
        header: {},
    }

    try {
        const databaseOnSaveResult = await pool.query(
            'insert into sensor_data (place_id, precipitation, water_level, temperature, humidity) values (?, ?, ?, ?, ?)',
            [place_id, precipitation, water_level, temperature, humidity]
        )
        if (databaseOnSaveResult[0].affectedRows > 0) {
            response.header = headerErrorCode.normalService
            res.json(response)
        } else {
            response.header = headerErrorCode.invalidRequestParameterError
            res.status(400).json(response)
        }
    } catch (error) {
        logger.error('/insert error message:', error)
        console.log(error)
        response.header = headerErrorCode.noDataError
        res.status(400).json(response)
    }
})

router.post('/status', async (req, res) => {
    logger.info('/status access')
    const { start_date, end_date } = req.body
    let response = {
        header: {},
    }
    const condition = [start_date, end_date]
    try {
        const databaseOnRoadResult = await pool.query('select place_id from sensor_data where created_at >= ? and created_at < ?', condition)
        response.header = headerErrorCode.normalService
        response.body = databaseOnRoadResult[0]

        res.json(response)
    } catch (error) {
        logger.error('/status error message:', error)
        response.header = headerErrorCode.noDataError
        res.status(400).json(response)
    }
})

module.exports = router
