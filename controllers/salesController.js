const Sales = require("../models/SalesModel");


// Helper function to calculate discount amount
const calculateDiscountAmount = (subtotal, discountPercentage) => {
  return (subtotal * discountPercentage) / 100;
};

// @desc    Create a new sale
// @route   POST /sales
// @access  Private
exports.createSale = async (req, res) => {
  try {
    const { items, discountPercentage } = req.body;

    // Validate items array
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required and cannot be empty",
      });
    }

    let subtotal = 0;
    const saleItems = [];

    // Process each item
    for (const item of items) {
      const { itemNumber, itemName, quantity, priceAtSale } = item;

      // Validate required fields
      if (!itemNumber || !itemName || !quantity || !priceAtSale) {
        return res.status(400).json({
          success: false,
          message: "Each item must have itemNumber, itemName, quantity, and priceAtSale",
        });
      }

      // Validate positive values
      if (quantity <= 0 || priceAtSale < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be positive and price cannot be negative",
        });
      }

      // Calculate item total
      const itemTotal = priceAtSale * quantity;
      subtotal += itemTotal;

      saleItems.push({
        itemNumber,
        itemName,
        quantity,
        priceAtSale,
      });
    }

    // Apply discount percentage if provided
    const discountPercentageValue = discountPercentage || 0;

    // Validate discount percentage
    if (discountPercentageValue < 0 || discountPercentageValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount percentage must be between 0 and 100",
      });
    }

    // Calculate discount amount
    const discountAmount = calculateDiscountAmount(subtotal, discountPercentageValue);
    const totalBillAmount = subtotal - discountAmount;

    // Create the sale
    const sale = await Sales.create({
      items: saleItems,
      subtotal,
      discountPercentage: discountPercentageValue,
      discountAmount,
      totalBillAmount,
    });

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({
      success: false,
      message: "Error creating sale",
      error: error.message,
    });
  }
};

// @desc    Get all sales
// @route   GET /sales
// @access  Private
exports.getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "-createdAt" } = req.query;

    const skip = (page - 1) * limit;

    const sales = await Sales.find()
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const totalSales = await Sales.countDocuments();

    res.status(200).json({
      success: true,
      message: "Sales retrieved successfully",
      data: sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSales / limit),
        totalSales,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales",
      error: error.message,
    });
  }
};

// @desc    Get sale by ID
// @route   GET /sales/:id
// @access  Private
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sales.findById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sale retrieved successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sale",
      error: error.message,
    });
  }
};

// @desc    Update sale by ID (ONLY itemName, quantity, discountPercentage)
// @route   PATCH /sales/:id
// @access  Private
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountPercentage, items } = req.body;

    const sale = await Sales.findById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // ---- Update items (itemNumber, itemName, and quantity) ----
    if (items && Array.isArray(items)) {
      for (const updatedItem of items) {
        const { _id, itemNumber, itemName, quantity } = updatedItem;

        if (!_id) {
          return res.status(400).json({
            success: false,
            message: "Each item update must include _id",
          });
        }

        const existingItem = sale.items.find(
          (i) => i._id.toString() === _id.toString()
        );

        if (!existingItem) {
          return res.status(404).json({
            success: false,
            message: `Item with _id ${_id} not found in this sale`,
          });
        }

        // Allow updating itemNumber, itemName, and quantity
        if (itemNumber !== undefined) {
          if (!itemNumber || itemNumber.trim() === "") {
            return res.status(400).json({
              success: false,
              message: "itemNumber cannot be empty",
            });
          }
          existingItem.itemNumber = itemNumber;
        }

        if (itemName !== undefined) {
          if (!itemName || itemName.trim() === "") {
            return res.status(400).json({
              success: false,
              message: "itemName cannot be empty",
            });
          }
          existingItem.itemName = itemName;
        }

        if (quantity !== undefined) {
          if (quantity <= 0) {
            return res.status(400).json({
              success: false,
              message: "Quantity must be positive",
            });
          }
          existingItem.quantity = quantity;
        }
      }
    }

    // ---- Recalculate subtotal after item updates ----
    let subtotal = 0;
    for (const item of sale.items) {
      subtotal += item.priceAtSale * item.quantity;
    }

    sale.subtotal = subtotal;

    // ---- Update discount percentage ----
    if (discountPercentage !== undefined) {
      if (discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: "Discount percentage must be between 0 and 100",
        });
      }
      sale.discountPercentage = discountPercentage;
    }

    // ---- Calculate discount amount and final total ----
    sale.discountAmount = calculateDiscountAmount(sale.subtotal, sale.discountPercentage);
    sale.totalBillAmount = sale.subtotal - sale.discountAmount;

    await sale.save();

    res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({
      success: false,
      message: "Error updating sale",
      error: error.message,
    });
  }
};

// @desc    Delete sale by ID
// @route   DELETE /sales/:id
// @access  Private
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sales.findById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    await Sales.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting sale",
      error: error.message,
    });
  }
};

// @desc    Get sales statistics
// @route   GET /sales/stats/summary
// @access  Private
exports.getSalesStats = async (req, res) => {
  try {
    const totalSales = await Sales.countDocuments();

    const salesAggregate = await Sales.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalBillAmount" },
          totalSubtotal: { $sum: "$subtotal" },
          totalDiscount: { $sum: "$discountAmount" },
          averageSale: { $avg: "$totalBillAmount" },
          totalItemsSold: { $sum: { $sum: "$items.quantity" } },
        },
      },
    ]);

    const stats = salesAggregate[0] || {
      totalRevenue: 0,
      totalSubtotal: 0,
      totalDiscount: 0,
      averageSale: 0,
      totalItemsSold: 0,
    };

    // Calculate average discount percentage
    const averageDiscountPercentage = totalSales > 0 
      ? (stats.totalDiscount / stats.totalSubtotal) * 100 
      : 0;

    res.status(200).json({
      success: true,
      message: "Sales statistics retrieved successfully",
      data: {
        totalSales,
        totalRevenue: stats.totalRevenue,
        totalSubtotal: stats.totalSubtotal,
        totalDiscount: stats.totalDiscount,
        averageSale: stats.averageSale,
        totalItemsSold: stats.totalItemsSold,
        averageDiscountPercentage: parseFloat(averageDiscountPercentage.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales statistics",
      error: error.message,
    });
  }
};

// @desc    Get sales by date range
// @route   GET /sales/stats/date-range
// @access  Private
exports.getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) {
        query.saleDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.saleDate.$lte = new Date(endDate);
      }
    }

    const sales = await Sales.find(query).sort({ saleDate: -1 });

    res.status(200).json({
      success: true,
      message: "Sales by date range retrieved successfully",
      data: sales,
      count: sales.length,
    });
  } catch (error) {
    console.error("Error fetching sales by date range:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales by date range",
      error: error.message,
    });
  }
};