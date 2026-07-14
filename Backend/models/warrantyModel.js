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
