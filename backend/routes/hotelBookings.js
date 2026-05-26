const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/hotelBookings - Add a new hotel booking
router.post('/', (req, res) => {
	const { userId, hotelId, checkIn, checkOut, totalPrice } = req.body;

	// Validate required fields
	if (!userId || !hotelId || !checkIn || !checkOut || totalPrice === undefined) {
		return res.status(400).json({
			error: 'Missing required fields.',
			required: ['userId', 'hotelId', 'checkIn', 'checkOut', 'totalPrice']
		});
	}

	// Validate data types
	if (isNaN(parseInt(userId)) || isNaN(parseInt(hotelId))) {
		return res.status(400).json({ error: 'userId and hotelId must be valid numbers.' });
	}

	const sql = 'INSERT INTO hotel_bookings (user_id, hotel_id, check_in, check_out, total_price, booking_date) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id';
	db.query(sql, [parseInt(userId), parseInt(hotelId), checkIn, checkOut, parseFloat(totalPrice)], (err, result) => {
		if (err) {
			return res.status(500).json({
				error: 'Database error occurred while creating hotel booking.',
				details: err.message
			});
		}
		res.status(201).json({
			success: true,
			booking_id: result.rows[0].id,
			message: 'Hotel booking created successfully'
		});
	});
});

// GET /api/hotelBookings?userId=xx - Get hotel bookings for a user
router.get('/', (req, res) => {
	const { userId } = req.query;
	let sql = 'SELECT hb.*, h.name as hotel_name, h.city FROM hotel_bookings hb JOIN hotels h ON hb.hotel_id = h.id WHERE 1=1';
	let params = [];
	let paramIndex = 1;

	if (userId) {
		sql += ` AND hb.user_id = $${paramIndex}`;
		params.push(parseInt(userId));
		paramIndex++;
	}

	sql += ' ORDER BY hb.booking_date DESC';

	db.query(sql, params, (err, result) => {
		if (err) {
			return res.status(500).json({
				error: 'Database error occurred while fetching hotel bookings.',
				details: err.message
			});
		}
		res.json({
			success: true,
			bookings: result.rows,
			count: result.rows.length
		});
	});
});

// DELETE /api/hotelBookings/:id - Cancel a hotel booking
router.delete('/:id', (req, res) => {
	const bookingId = req.params.id;

	// Validate booking ID
	if (!bookingId || isNaN(parseInt(bookingId))) {
		return res.status(400).json({ error: 'Invalid booking ID provided.' });
	}

	// Delete the booking
	const sql = 'DELETE FROM hotel_bookings WHERE id = $1';
	db.query(sql, [parseInt(bookingId)], (err, result) => {
		if (err) {
			return res.status(500).json({
				error: 'Database error occurred while cancelling hotel booking.',
				details: err.message
			});
		}
		if (result.rowCount === 0) {
				return res.status(404).json({ error: 'Hotel booking not found.' });
		}
		res.json({
			success: true,
			message: 'Hotel booking cancelled successfully',
			booking_id: parseInt(bookingId)
		});
	});
});

module.exports = router;
