const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/hotelBookings - Add a new hotel booking
router.post('/', (req, res) => {
	const { userId, destination, hotel_name, booking_date } = req.body;
	
	// Validate required fields
	if (!userId || !destination || !hotel_name || !booking_date) {
		return res.status(400).json({ 
			error: 'Missing required fields.',
			required: ['userId', 'destination', 'hotel_name', 'booking_date'],
			received: req.body
		});
	}

	// Validate data types
	if (typeof userId !== 'number' && isNaN(parseInt(userId))) {
		return res.status(400).json({ error: 'userId must be a valid number.' });
	}

	const sql = 'INSERT INTO hotel_bookings (user_id, destination, hotel_name, booking_date, status) VALUES (?, ?, ?, ?, ?)';
	db.query(sql, [parseInt(userId), destination, hotel_name, booking_date, 'active'], (err, result) => {
		if (err) {
			return res.status(500).json({ 
				error: 'Database error occurred while creating hotel booking.',
				details: err.message 
			});
		}
		res.status(201).json({ 
			success: true,
			booking_id: result.insertId,
			message: 'Hotel booking created successfully'
		});
	});
});

// GET /api/hotelBookings?userId=xx - Get hotel bookings for a user
router.get('/', (req, res) => {
	const { userId } = req.query;
	let sql = 'SELECT * FROM hotel_bookings WHERE status = ?';
	let params = ['active'];
	
	if (userId) {
		sql += ' AND user_id = ?';
		params.push(parseInt(userId));
	}
	
	sql += ' ORDER BY created_at DESC';
	
	db.query(sql, params, (err, results) => {
		if (err) {
			return res.status(500).json({ 
				error: 'Database error occurred while fetching hotel bookings.',
				details: err.message 
			});
		}
		res.json({
			success: true,
			bookings: results,
			count: results.length
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
	
	// Use soft delete by updating status instead of hard delete
	const sql = 'UPDATE hotel_bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_id = ? AND status = ?';
	db.query(sql, ['cancelled', parseInt(bookingId), 'active'], (err, result) => {
		if (err) {
			return res.status(500).json({ 
				error: 'Database error occurred while cancelling hotel booking.',
				details: err.message 
			});
		}
		if (result.affectedRows === 0) {
				return res.status(404).json({ error: 'Active hotel booking not found.' });
		}
		res.json({ 
			success: true,
			message: 'Hotel booking cancelled successfully',
			booking_id: parseInt(bookingId)
		});
	});
});

module.exports = router;
