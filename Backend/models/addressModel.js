const db = require("../config/db");

class AddressModel {
  static async getAllByUser(userId) {
    const [rows] = await db.query(
      `SELECT id, user_id, full_name, phone, address_line, subdistrict, district, province, postal_code, is_default, created_at, updated_at
       FROM addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, updated_at DESC`,
      [userId],
    );

    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT id, user_id, full_name, phone, address_line, subdistrict, district, province, postal_code, is_default, created_at, updated_at
       FROM addresses
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    return rows[0];
  }

  static async countByUser(userId) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count FROM addresses WHERE user_id = ?`,
      [userId],
    );

    return rows[0].count;
  }

  static async createAddress(userId, addressData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [[{ count }]] = await connection.query(
        `SELECT COUNT(*) AS count FROM addresses WHERE user_id = ?`,
        [userId],
      );
      const isDefault = count === 0 || addressData.is_default === true;

      if (isDefault) {
        await connection.query(
          `UPDATE addresses SET is_default = 0 WHERE user_id = ?`,
          [userId],
        );
      }

      const [result] = await connection.query(
        `INSERT INTO addresses
          (user_id, full_name, phone, address_line, subdistrict, district, province, postal_code, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          addressData.full_name,
          addressData.phone,
          addressData.address_line,
          addressData.subdistrict,
          addressData.district,
          addressData.province,
          addressData.postal_code,
          isDefault ? 1 : 0,
        ],
      );

      await connection.commit();

      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateAddress(id, userId, addressData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const existingAddress = await this.findById(id);
      if (!existingAddress || existingAddress.user_id !== userId) {
        await connection.rollback();
        return null;
      }

      if (addressData.is_default === true) {
        await connection.query(
          `UPDATE addresses SET is_default = 0 WHERE user_id = ?`,
          [userId],
        );
      }

      const fields = [];
      const params = [];

      if (addressData.full_name !== undefined) {
        fields.push(`full_name = ?`);
        params.push(addressData.full_name);
      }
      if (addressData.phone !== undefined) {
        fields.push(`phone = ?`);
        params.push(addressData.phone);
      }
      if (addressData.address_line !== undefined) {
        fields.push(`address_line = ?`);
        params.push(addressData.address_line);
      }
      if (addressData.subdistrict !== undefined) {
        fields.push(`subdistrict = ?`);
        params.push(addressData.subdistrict);
      }
      if (addressData.district !== undefined) {
        fields.push(`district = ?`);
        params.push(addressData.district);
      }
      if (addressData.province !== undefined) {
        fields.push(`province = ?`);
        params.push(addressData.province);
      }
      if (addressData.postal_code !== undefined) {
        fields.push(`postal_code = ?`);
        params.push(addressData.postal_code);
      }
      if (addressData.is_default !== undefined) {
        fields.push(`is_default = ?`);
        params.push(addressData.is_default ? 1 : 0);
      }

      if (fields.length > 0) {
        params.push(id, userId);
        await connection.query(
          `UPDATE addresses SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
          params,
        );
      }

      if (addressData.is_default === false && existingAddress.is_default === 1) {
        const [activeDefault] = await connection.query(
          `SELECT id FROM addresses WHERE user_id = ? AND id != ? AND is_default = 1 LIMIT 1`,
          [userId, id],
        );

        if (activeDefault.length === 0) {
          const [fallbackRows] = await connection.query(
            `SELECT id FROM addresses WHERE user_id = ? AND id != ? ORDER BY updated_at DESC LIMIT 1`,
            [userId, id],
          );

          if (fallbackRows.length > 0) {
            await connection.query(
              `UPDATE addresses SET is_default = 1 WHERE id = ?`,
              [fallbackRows[0].id],
            );
          }
        }
      }

      await connection.commit();
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async setDefaultAddress(id, userId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const address = await this.findById(id);
      if (!address || address.user_id !== userId) {
        await connection.rollback();
        return null;
      }

      await connection.query(
        `UPDATE addresses SET is_default = 0 WHERE user_id = ?`,
        [userId],
      );
      await connection.query(
        `UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?`,
        [id, userId],
      );

      await connection.commit();
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteAddress(id, userId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT id, is_default FROM addresses WHERE id = ? AND user_id = ? LIMIT 1 FOR UPDATE`,
        [id, userId],
      );

      if (rows.length === 0) {
        await connection.rollback();
        return false;
      }

      const address = rows[0];
      await connection.query(`DELETE FROM addresses WHERE id = ? AND user_id = ?`, [id, userId]);

      if (address.is_default === 1) {
        const [fallbackRows] = await connection.query(
          `SELECT id FROM addresses WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`,
          [userId],
        );

        if (fallbackRows.length > 0) {
          await connection.query(
            `UPDATE addresses SET is_default = 1 WHERE id = ?`,
            [fallbackRows[0].id],
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async isAddressUsedByOrder(addressId) {
    const candidateColumns = ["shipping_address_id", "billing_address_id", "address_id"];

    for (const column of candidateColumns) {
      try {
        const [rows] = await db.query(
          `SELECT 1 FROM orders WHERE ${column} = ? LIMIT 1`,
          [addressId],
        );

        if (rows.length > 0) {
          return true;
        }
      } catch (error) {
        if (error.errno === 1146 || error.errno === 1054) {
          continue;
        }
        throw error;
      }
    }

    return false;
  }
}

module.exports = AddressModel;
