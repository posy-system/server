const bill = require('../models/bill');

//get all bills with pagination
const getAllBills = async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Call external API
    // const apiResponse = await axios.get("https://external-api.com/bills");
    const fetchedBills = await bill.find();

    const totalBills = fetchedBills.length;
    const totalPages = Math.ceil(totalBills / limit);

    // Calculate slice indexes
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Paginated result
    const paginatedBills = fetchedBills.slice(startIndex, endIndex);

    return res.status(200).json({
      message: "Bills fetched successfully",
      bills: paginatedBills,
      totalBills,
      totalPages,
      currentPage: page,
      limit
    });

  } catch (error) {
    console.error("Error fetching bills:", error.message);
    return res.status(500).json({ error: "Failed to fetch bills from external API" });
  }
};

//get bills by id
const getBillById = async (req, res) => {
    try {
        const { id } = req.params;
        const fetchedBill = await bill.findById(id);
        return res.status(200).json({ message: 'Bill fetched successfully', billData: fetchedBill });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

//patch bill
const updateBill = async (req, res) => {
    try {
        const { id } = req.params;
        const { items, discount } = req.body;
        //this is temporary update in local db, code to update in external api should be here
        const updatedBill = await bill.findByIdAndUpdate(id, { items, discount }, { new: true });
        return res.status(200).json({ message: 'Bill updated successfully', updatedBill });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

//delete bill
const deleteBill = async (req, res) => {
    try {
        const { id } = req.params;
        await bill.findByIdAndDelete(id);
        //code to delete from external api if any should be here
        return res.status(200).json({ message: 'Bill deleted successfully' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports = { getAllBills, getBillById, updateBill, deleteBill };