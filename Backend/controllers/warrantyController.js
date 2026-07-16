const WarrantyModel = require("../models/warrantyModel");

class WarrantyController {
  // GET /api/warranties/my
  static async getMyWarranties(req, res) {
    try {
      const userId = req.user.user_id;
      const warranties = await WarrantyModel.getMyWarranties(userId);

      res.status(200).json({
        success: true,
        count: warranties.length,
        data: warranties,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch warranties",
      });
    }
  }

  // GET /api/warranties/:id
  static async getWarrantyById(req, res) {
    try {
      const userId = req.user.user_id;
      const warrantyId = req.params.id;
      const warranty = await WarrantyModel.getWarrantyById(userId, warrantyId);

      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: "Warranty not found",
        });
      }

      res.status(200).json({
        success: true,
        data: warranty,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch warranty",
      });
    }
  }

  // POST /api/warranties/claims
  static async createClaim(req, res) {
    try {
      const userId = req.user.user_id;
      const { warranty_id, problem_description } = req.body;

      const result = await WarrantyModel.createClaim(
        userId,
        warranty_id,
        problem_description,
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      res.status(201).json({
        success: true,
        message: "Warranty claim submitted successfully.",
        claimId: result.claimId,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to submit warranty claim",
      });
    }
  }

  // GET /api/warranties/claims/my
  static async getMyClaims(req, res) {
    try {
      const userId = req.user.user_id;
      const claims = await WarrantyModel.getMyClaims(userId);

      res.status(200).json({
        success: true,
        count: claims.length,
        data: claims,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch claims",
      });
    }
  }

  // GET /api/warranty-claims/:id
  static async getClaimByIdForAdmin(req, res) {
    try {
      const claim = await WarrantyModel.getClaimByIdForAdmin(req.params.id);

      if (!claim) {
        return res.status(404).json({
          success: false,
          message: "Claim not found",
        });
      }

      res.status(200).json({
        success: true,
        data: claim,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch claim",
      });
    }
  }

  // GET /api/warranties/admin/claims
  static async getAllClaims(req, res) {
    try {
      const claims = await WarrantyModel.getAllClaims();

      res.status(200).json({
        success: true,
        count: claims.length,
        data: claims,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch claims",
      });
    }
  }

  // PUT /api/warranties/admin/claims/:id/status
  static async updateClaimStatus(req, res) {
    try {
      const claimId = req.params.id;
      const { claim_status, admin_remark } = req.body;

      const result = await WarrantyModel.updateClaimStatus(
        claimId,
        claim_status,
        admin_remark,
      );

      if (!result || result.success === false || result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message:
            result && result.error
              ? result.error
              : "Failed to update claim status",
        });
      }

      res.status(200).json({
        success: true,
        message: "Claim status updated successfully.",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to update claim status",
      });
    }
  }
}

module.exports = WarrantyController;
