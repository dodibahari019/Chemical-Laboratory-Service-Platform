import db from "../config/db.js";
import midtransClient from 'midtrans-client';

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'YOUR_SERVER_KEY',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY'
});

export const createRequest = async (req, res) => {
  const { user_id, notes, start_date, end_date, tools, reagents, customer_details } = req.body;

  try {
    // Validate required fields
    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate tools or reagents exist
    if ((!tools || tools.length === 0) && (!reagents || reagents.length === 0)) {
      return res.status(400).json({ error: "At least one tool or reagent must be selected" });
    }

    // Call stored procedure to create request (status: pending payment)
    const [results] = await db.query(
      `CALL sp_create_request(?, ?, ?, ?, ?, ?, @request_id, @payment_id, @total_amount)`,
      [
        user_id,
        notes || '',
        start_date,
        end_date,
        tools && tools.length > 0 ? JSON.stringify(tools) : null,
        reagents && reagents.length > 0 ? JSON.stringify(reagents) : null
      ]
    );

    // Get output parameters
    const [outputParams] = await db.query(
      'SELECT @request_id as request_id, @payment_id as payment_id, @total_amount as total_amount'
    );

    const { request_id, payment_id, total_amount } = outputParams[0];

    // ✅ UBAH BAGIAN INI: Buat order_id yang unik dengan timestamp
    const orderId = `${payment_id}-${Date.now()}`;
    const grossAmount = parseFloat(total_amount);

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      customer_details: customer_details || {
        first_name: "Customer",
        email: "customer@example.com",
        phone: "08123456789"
      },
      item_details: [
        {
          id: request_id,
          price: grossAmount,
          quantity: 1,
          name: `Lab Request ${request_id}`
        }
      ],
      callbacks: {
        finish: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?request_id=${request_id}`
      }
    };

    const transaction = await snap.createTransaction(parameter);

    // ✅ SIMPAN order_id ke database agar bisa dilacak
    await db.query(
      `UPDATE payments 
       SET transaction_ref = ? 
       WHERE payment_id = ?`,
      [orderId, payment_id]
    );

    res.json({
      success: true,
      request_id,
      payment_id,
      total_amount,
      snap_token: transaction.token,
      snap_redirect_url: transaction.redirect_url
    });

  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { payment_id, status, transaction_ref } = req.body;

  try {
    // Update payment status
    await db.query(
      `UPDATE payments 
       SET payment_status = ?, 
           transaction_ref = ?, 
           paid_at = ? 
       WHERE payment_id = ?`,
      [status, transaction_ref, status === 'paid' ? new Date() : null, payment_id]
    );

    // If payment is successful, update request status to 'approved' or keep as 'pending' for admin review
    if (status === 'paid') {
      // Get request_id from payment
      const [payment] = await db.query(
        'SELECT request_id FROM payments WHERE payment_id = ?',
        [payment_id]
      );

      if (payment.length > 0) {
        const request_id = payment[0].request_id;
        
        // Update request status to show payment completed (but still needs admin approval)
        await db.query(
          `UPDATE requests SET status = 'pending' WHERE request_id = ?`,
          [request_id]
        );

        // Create schedule entry with status 'scheduled'
        const [schedule_count] = await db.query(
          'SELECT COALESCE(MAX(CAST(SUBSTRING(schedule_id, 4) AS UNSIGNED)), 0) + 1 as next_id FROM schedules'
        );
        const schedule_id = `SCH${String(schedule_count[0].next_id).padStart(7, '0')}`;

        // Get start_date and end_date from request notes (temporary solution)
        // Better to store these separately in future
        const [request_data] = await db.query(
          'SELECT notes FROM requests WHERE request_id = ?',
          [request_id]
        );

        // Parse dates from notes or use default
        // This is a temporary solution - better to have separate columns
        await db.query(
          `INSERT INTO schedules (schedule_id, request_id, status) 
           VALUES (?, ?, 'scheduled')`,
          [schedule_id, request_id]
        );
      }
    }
    
    res.json({ success: true, message: 'Payment status updated' });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Webhook handler for Midtrans notification
export const handleMidtransNotification = async (req, res) => {
  try {
    const notification = req.body;
    
    const statusResponse = await snap.transaction.notification(notification);
    
    const orderId = statusResponse.order_id; // Format: PAY0000001-1738840123456
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let paymentStatus = 'pending';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        paymentStatus = 'paid';
      }
    } else if (transactionStatus == 'settlement') {
      paymentStatus = 'paid';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      paymentStatus = 'failed';
    } else if (transactionStatus == 'pending') {
      paymentStatus = 'pending';
    }

    // ✅ Update payment berdasarkan transaction_ref (order_id)
    await db.query(
      `UPDATE payments 
       SET payment_status = ?, 
           paid_at = ? 
       WHERE transaction_ref = ?`,
      [
        paymentStatus,
        paymentStatus === 'paid' ? new Date() : null,
        orderId
      ]
    );

    // If paid, create schedule
    if (paymentStatus === 'paid') {
      const [payment] = await db.query(
        'SELECT request_id FROM payments WHERE transaction_ref = ?',
        [orderId]
      );

      if (payment.length > 0) {
        const request_id = payment[0].request_id;
        
        // Check if schedule already exists
        const [existing_schedule] = await db.query(
          'SELECT schedule_id FROM schedules WHERE request_id = ?',
          [request_id]
        );

        if (existing_schedule.length === 0) {
          const [schedule_count] = await db.query(
            'SELECT COALESCE(MAX(CAST(SUBSTRING(schedule_id, 4) AS UNSIGNED)), 0) + 1 as next_id FROM schedules'
          );
          const schedule_id = `SCH${String(schedule_count[0].next_id).padStart(7, '0')}`;

          await db.query(
            `INSERT INTO schedules (schedule_id, request_id, status) 
             VALUES (?, ?, 'scheduled')`,
            [schedule_id, request_id]
          );
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Midtrans notification error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_get_all_requests");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const [results] = await db.query(
      "CALL sp_get_request_by_id(?)",
      [req.params.id]
    );
    
    if (!results[0] || results[0].length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const requestData = {
      ...results[0][0],
      tools: results[1] || [],
      reagents: results[2] || []
    };

    res.json(requestData);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const searchRequests = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const [rows] = await db.query(
      "CALL sp_search_requests(?)",
      [keyword]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const approveRequest = async (req, res) => {
  const { admin_notes } = req.body;

  try {
    await db.query(
      "CALL sp_approve_request(?,?)",
      [req.params.id, admin_notes]
    );

    res.json({ message: "Request approved successfully" });
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const rejectRequest = async (req, res) => {
  const { admin_notes } = req.body;

  if (!admin_notes || admin_notes.trim() === '') {
    return res.status(400).json({ error: "Alasan penolakan harus diisi" });
  }

  try {
    await db.query(
      "CALL sp_reject_request(?,?)",
      [req.params.id, admin_notes]
    );

    res.json({ message: "Request rejected successfully" });
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const cancelRequest = async (req, res) => {
  try {
    await db.query(
      "CALL sp_cancel_request(?)",
      [req.params.id]
    );

    res.json({ message: "Request cancelled successfully" });
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const getRequestStats = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_request_stats()");
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};