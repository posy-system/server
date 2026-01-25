const bill = require("../models/bill");

// Get all bills
const getAllBills = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bills = await bill.find().skip(skip).limit(limit);
    const totalBills = await bill.countDocuments();
    const totalPages = Math.ceil(totalBills / limit);

    if (!bills || bills.length === 0) {
      return res.status(404).json({ error: "No bills found" });
    }

    return res.status(200).json({
      message: "Bills fetched successfully",
      bills,
      pagination: {
        currentPage: page,
        totalPages,
        totalBills,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single bill by ID
const getBill = async (req, res) => {
  try {
    const { id } = req.params;
    const billData = await bill.findById(id);
    if (!billData) {
      return res.status(404).json({ error: "Bill not found" });
    }
    return res
      .status(200)
      .json({ message: "Bill fetched successfully", bill: billData });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a bill by ID
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBill = await bill.findByIdAndDelete(id);
    if (!deletedBill) {
      return res.status(404).json({ error: "Bill not found" });
    }
    return res
      .status(200)
      .json({ message: "Bill deleted successfully", bill: deletedBill });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update a bill by ID
const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBill = await bill.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedBill) {
      return res.status(404).json({ error: "Bill not found" });
    }
    return res
      .status(200)
      .json({ message: "Bill updated successfully", bill: updatedBill });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllBills,
  getBill,
  deleteBill,
  updateBill,
};
