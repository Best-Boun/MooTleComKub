const db = require("../config/db");

class WarrantyModel {
  // ลูกค้า: ดูประกันของตนเองทั้งหมด
  static async getMyWarranties(userId) {
    const [rows] = await db.query(
      `
			SELECT
				w.warranty_id,
				w.order_item_id,
				w.serial_number,
				w.warranty_provider,
				w.warranty_start_date,
				w.warranty_end_date,
				w.warranty_status,
				oi.order_id,
				oi.product_id,
				oi.quantity,
				oi.unit_price,
				oi.subtotal
			FROM orders o
			INNER JOIN order_items oi
				ON o.order_id = oi.order_id
			INNER JOIN warranties w
				ON oi.order_item_id = w.order_item_id
			WHERE o.user_id = ?
			ORDER BY w.warranty_id DESC
			`,
      [userId],
    );

    return rows;
  }

  // ลูกค้า: ดูประกันตาม ID
  static async getWarrantyById(userId, warrantyId) {
    const [rows] = await db.query(
      `
			SELECT
				w.warranty_id,
				w.order_item_id,
				w.serial_number,
				w.warranty_provider,
				w.warranty_start_date,
				w.warranty_end_date,
				w.warranty_status,
				oi.order_id,
				oi.product_id,
				oi.quantity,
				oi.unit_price,
				oi.subtotal
			FROM orders o
			INNER JOIN order_items oi
				ON o.order_id = oi.order_id
			INNER JOIN warranties w
				ON oi.order_item_id = w.order_item_id
			WHERE o.user_id = ?
				AND w.warranty_id = ?
			LIMIT 1
			`,
      [userId, warrantyId],
    );

    return rows[0];
  }

  // ระบบ: สร้าง Warranty ให้ทุก order_item ของ order เมื่อสถานะเป็น DELIVERED
  static async createWarrantiesForOrder(orderId) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [orderItems] = await connection.query(
        `
				SELECT
					oi.order_item_id,
					p.warranty_provider
				FROM order_items oi
				LEFT JOIN products p
					ON oi.product_id = p.product_id
				WHERE oi.order_id = ?
				`,
        [orderId],
      );

      let createdCount = 0;

      for (const item of orderItems) {
        const [existingRows] = await connection.query(
          `SELECT warranty_id FROM warranties WHERE order_item_id = ? LIMIT 1`,
          [item.order_item_id],
        );

        if (existingRows.length > 0) {
          continue;
        }

        let serialNumber = "";
        let isUnique = false;

        while (!isUnique) {
          serialNumber = `SN${Date.now()}${Math.floor(Math.random() * 1000)}`;

          const [existingSerialRows] = await connection.query(
            `SELECT warranty_id FROM warranties WHERE serial_number = ? LIMIT 1`,
            [serialNumber],
          );

          if (existingSerialRows.length === 0) {
            isUnique = true;
          }
        }

        await connection.query(
          `
					INSERT INTO warranties
					(
						order_item_id,
						serial_number,
						warranty_provider,
						warranty_start_date,
						warranty_end_date,
						warranty_status
					)
					VALUES (?, ?, ?, NOW(), NOW() + INTERVAL 3 YEAR, 'ACTIVE')
					`,
          [item.order_item_id, serialNumber, item.warranty_provider || null],
        );

        createdCount += 1;
      }

      await connection.commit();

      return createdCount;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ลูกค้า: สร้างเคลมประกัน
  static async createClaim(userId, warrantyId, problemDescription) {
    const [warrantyRows] = await db.query(
      `
			SELECT
				w.warranty_id,
				w.warranty_end_date,
				w.warranty_status
			FROM warranties w
			INNER JOIN order_items oi
				ON w.order_item_id = oi.order_item_id
			INNER JOIN orders o
				ON oi.order_id = o.order_id
			WHERE w.warranty_id = ?
				AND o.user_id = ?
			LIMIT 1
			`,
      [warrantyId, userId],
    );

    if (warrantyRows.length === 0) {
      return { success: false, error: "Warranty not found" };
    }

    const warranty = warrantyRows[0];

    if (warranty.warranty_status !== "ACTIVE") {
      return { success: false, error: "Warranty is not active" };
    }

    if (new Date() > new Date(warranty.warranty_end_date)) {
      return { success: false, error: "Warranty has expired." };
    }

    const [activeClaimRows] = await db.query(
      `
			SELECT claim_id
			FROM warranty_claims
			WHERE warranty_id = ?
			AND claim_status IN ('PENDING','APPROVED')
			LIMIT 1
			`,
      [warrantyId],
    );

    if (activeClaimRows.length > 0) {
      return {
        success: false,
        error: "This warranty already has an active claim.",
      };
    }

    let claimNumber = "";
    let isUnique = false;

    while (!isUnique) {
      claimNumber = `CLM${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const [existingRows] = await db.query(
        `
				SELECT claim_id
				FROM warranty_claims
				WHERE claim_number = ?
				LIMIT 1
				`,
        [claimNumber],
      );

      if (existingRows.length === 0) {
        isUnique = true;
      }
    }

    const [result] = await db.query(
      `
			INSERT INTO warranty_claims
			(
				warranty_id,
				user_id,
				claim_number,
				problem_description,
				claim_status,
				submitted_at
			)
			VALUES (?, ?, ?, ?, 'PENDING', NOW())
			`,
      [warrantyId, userId, claimNumber, problemDescription],
    );

    return {
      success: true,
      claimId: result.insertId,
    };
  }

  // ลูกค้า: ดูรายการเคลมทั้งหมดของตนเอง
  static async getMyClaims(userId) {
    const [rows] = await db.query(
      `
			SELECT
				claim_id,
				warranty_id,
				user_id,
				claim_number,
				problem_description,
				claim_status,
				submitted_at,
				completed_at,
				admin_remark
			FROM warranty_claims
			WHERE user_id = ?
			ORDER BY submitted_at DESC
			`,
      [userId],
    );

    return rows;
  }

  // ลูกค้า: ดูเคลมตาม ID
  static async getClaimById(userId, claimId) {
    const [rows] = await db.query(
      `
			SELECT
				claim_id,
				warranty_id,
				user_id,
				claim_number,
				problem_description,
				claim_status,
				submitted_at,
				completed_at,
				admin_remark
			FROM warranty_claims
			WHERE user_id = ?
				AND claim_id = ?
			LIMIT 1
			`,
      [userId, claimId],
    );

    return rows[0];
  }

  // Admin: ดูรายละเอียด Claim
  static async getClaimByIdForAdmin(claimId) {
    const [rows] = await db.query(
      `
    SELECT
      wc.claim_id,
      wc.claim_number,
      wc.problem_description,
      wc.claim_status,
      wc.submitted_at,
      wc.completed_at,
      wc.admin_remark,

      u.first_name,
      u.last_name,
      u.email,

      w.serial_number,
      w.warranty_provider,
      w.warranty_start_date,
      w.warranty_end_date,

      p.product_name

    FROM warranty_claims wc

    LEFT JOIN users u
      ON wc.user_id = u.user_id

    LEFT JOIN warranties w
      ON wc.warranty_id = w.warranty_id

    LEFT JOIN order_items oi
      ON w.order_item_id = oi.order_item_id

    LEFT JOIN products p
      ON oi.product_id = p.product_id

    WHERE wc.claim_id = ?
    LIMIT 1
    `,
      [claimId],
    );

    return rows[0];
  }

  // แอดมิน: ดูคำขอเคลมทั้งหมด
  static async getAllClaims() {
    const [rows] = await db.query(
      `
			SELECT
				wc.claim_id,
				wc.warranty_id,
				wc.user_id,
				wc.claim_number,
				wc.problem_description,
				wc.claim_status,
				wc.submitted_at,
				wc.completed_at,
				wc.admin_remark,
				w.order_item_id,
				w.serial_number,
				w.warranty_provider,
				w.warranty_start_date,
				w.warranty_end_date,
				w.warranty_status
			FROM warranty_claims wc
			LEFT JOIN warranties w
				ON wc.warranty_id = w.warranty_id
			ORDER BY wc.submitted_at DESC
			`,
    );

    return rows;
  }

  // แอดมิน: อัปเดตสถานะเคลม
  static async updateClaimStatus(claimId, status, adminRemark) {
    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

    if (!allowedStatuses.includes(status)) {
      return { success: false, error: "Invalid claim status" };
    }

    let result;

    if (status === "COMPLETED") {
      [result] = await db.query(
        `
				UPDATE warranty_claims
				SET
					claim_status = ?,
					completed_at = NOW(),
					admin_remark = ?
				WHERE claim_id = ?
				`,
        [status, adminRemark, claimId],
      );
    } else {
      [result] = await db.query(
        `
				UPDATE warranty_claims
				SET
					claim_status = ?,
					admin_remark = ?
				WHERE claim_id = ?
				`,
        [status, adminRemark, claimId],
      );
    }

    return result;
  }
}

module.exports = WarrantyModel;
