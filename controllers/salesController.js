const Sales = require("../models/SalesModel");
const Inventory = require("../models/Inventery");
const mongoose = require("mongoose");

// Helper function to calculate discount amount
const calculateDiscountAmount = (subtotal, discountPercentage) => {
  return (subtotal * discountPercentage) / 100;
};

// Helper function to update inventory quantity
const updateInventoryQuantity = async (itemNumber, quantityChange, operation = 'subtract', session = null) => {
  try {
    const inventoryItem = await Inventory.findOne({ itemNumber: parseInt(itemNumber) }).session(session);
    
    if (!inventoryItem) {
      throw new Error(`Inventory item with number ${itemNumber} not found`);
    }

    if (operation === 'subtract') {
      if (inventoryItem.quantity < quantityChange) {
        throw new Error(`Insufficient stock for item ${itemNumber}. Available: ${inventoryItem.quantity}, Requested: ${quantityChange}`);
      }
      inventoryItem.quantity -= quantityChange;
    } else if (operation === 'add') {
      inventoryItem.quantity += quantityChange;
    }

    // Update availability based on quantity
    inventoryItem.available = inventoryItem.quantity > 0;
    
    await inventoryItem.save({ session });
    return inventoryItem;
  } catch (error) {
    throw error;
  }
};

// @desc    Create a new sale
// @route   POST /sales
// @access  Private
exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, discountPercentage } = req.body;

    // Validate items array
    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Items array is required and cannot be empty",
      });
    }

    let subtotal = 0;
    const saleItems = [];

    // Process each item and validate inventory
    for (const item of items) {
      const { itemNumber, itemName, quantity, priceAtSale } = item;

      // Validate required fields
      if (!itemNumber || !itemName || !quantity || !priceAtSale) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Each item must have itemNumber, itemName, quantity, and priceAtSale",
        });
      }

      // Validate positive values
      if (quantity <= 0 || priceAtSale < 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Quantity must be positive and price cannot be negative",
        });
      }

      // Check inventory availability BEFORE creating sale
      const inventoryItem = await Inventory.findOne({ 
        itemNumber: parseInt(itemNumber) 
      }).session(session);

      if (!inventoryItem) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Item ${itemNumber} not found in inventory`,
        });
      }

      if (inventoryItem.quantity < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for item ${itemNumber}. Available: ${inventoryItem.quantity}, Requested: ${quantity}`,
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
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Discount percentage must be between 0 and 100",
      });
    }

    // Calculate discount amount
    const discountAmount = calculateDiscountAmount(subtotal, discountPercentageValue);
    const totalBillAmount = subtotal - discountAmount;

    // Create the sale
    const sale = await Sales.create([{
      items: saleItems,
      subtotal,
      discountPercentage: discountPercentageValue,
      discountAmount,
      totalBillAmount,
    }], { session });

    // Update inventory quantities (subtract)
    for (const item of saleItems) {
      await updateInventoryQuantity(item.itemNumber, item.quantity, 'subtract', session);
    }

    await session.commitTransaction();
    session.endSession();

    // Fetch the complete sale document
    const createdSale = await Sales.findById(sale[0]._id);

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: createdSale,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error creating sale:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating sale",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

// @desc    Update sale by ID
// @route   PATCH /sales/:id
// @access  Private
exports.updateSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { discountPercentage, items } = req.body;

    const sale = await Sales.findById(id).session(session);

    if (!sale) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Store old items for inventory restoration
    const oldItems = [...sale.items];

    // ---- Update items (itemNumber, itemName, and quantity) ----
    if (items && Array.isArray(items)) {
      for (const updatedItem of items) {
        const { _id, itemNumber, itemName, quantity } = updatedItem;

        if (!_id) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: "Each item update must include _id",
          });
        }

        const existingItem = sale.items.find(
          (i) => i._id.toString() === _id.toString()
        );

        if (!existingItem) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            success: false,
            message: `Item with _id ${_id} not found in this sale`,
          });
        }

        // Store old values for inventory adjustment
        const oldItemNumber = existingItem.itemNumber;
        const oldQuantity = existingItem.quantity;

        // Handle itemNumber change
        if (itemNumber !== undefined && itemNumber !== oldItemNumber) {
          // Validate new item exists in inventory
          const newInventoryItem = await Inventory.findOne({ 
            itemNumber: parseInt(itemNumber) 
          }).session(session);

          if (!newInventoryItem) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: `Item ${itemNumber} not found in inventory`,
            });
          }

          // Check stock availability for new item
          if (quantity !== undefined) {
            if (newInventoryItem.quantity < quantity) {
              await session.abortTransaction();
              session.endSession();
              return res.status(400).json({
                success: false,
                message: `Insufficient stock for item ${itemNumber}. Available: ${newInventoryItem.quantity}, Requested: ${quantity}`,
              });
            }
          } else if (newInventoryItem.quantity < oldQuantity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for item ${itemNumber}. Available: ${newInventoryItem.quantity}, Requested: ${oldQuantity}`,
            });
          }
        }

        // Allow updating itemNumber, itemName, and quantity
        if (itemNumber !== undefined) {
          if (!itemNumber || itemNumber.trim() === "") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: "itemNumber cannot be empty",
            });
          }
          existingItem.itemNumber = itemNumber;
        }

        if (itemName !== undefined) {
          if (!itemName || itemName.trim() === "") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: "itemName cannot be empty",
            });
          }
          existingItem.itemName = itemName;
        }

        if (quantity !== undefined) {
          if (quantity <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: "Quantity must be positive",
            });
          }

          // Check inventory if quantity is increased
          if (quantity > oldQuantity) {
            const inventoryItem = await Inventory.findOne({ 
              itemNumber: parseInt(existingItem.itemNumber) 
            }).session(session);
            
            const additionalQuantity = quantity - oldQuantity;
            if (inventoryItem.quantity < additionalQuantity) {
              await session.abortTransaction();
              session.endSession();
              return res.status(400).json({
                success: false,
                message: `Insufficient stock for additional quantity. Available: ${inventoryItem.quantity}, Requested additional: ${additionalQuantity}`,
              });
            }
          }
          existingItem.quantity = quantity;
        }
      }
    }

    // ---- Update inventory based on changes ----
    for (const updatedItem of (items || [])) {
      const { _id, itemNumber, quantity } = updatedItem;
      const oldItem = oldItems.find(i => i._id.toString() === _id.toString());

      if (oldItem) {
        const newItemNumber = itemNumber !== undefined ? itemNumber : oldItem.itemNumber;
        const newQuantity = quantity !== undefined ? quantity : oldItem.quantity;

        // Handle item number change
        if (newItemNumber !== oldItem.itemNumber) {
          // Add back to old inventory
          await updateInventoryQuantity(oldItem.itemNumber, oldItem.quantity, 'add', session);
          // Subtract from new inventory
          await updateInventoryQuantity(newItemNumber, newQuantity, 'subtract', session);
        } else {
          // Same item, adjust quantity difference
          const quantityDifference = newQuantity - oldItem.quantity;
          if (quantityDifference > 0) {
            // More quantity requested, subtract difference
            await updateInventoryQuantity(newItemNumber, quantityDifference, 'subtract', session);
          } else if (quantityDifference < 0) {
            // Less quantity requested, add back difference
            await updateInventoryQuantity(newItemNumber, -quantityDifference, 'add', session);
          }
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
        await session.abortTransaction();
        session.endSession();
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

    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Fetch the updated sale
    const updatedSale = await Sales.findById(id);

    res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: updatedSale,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error updating sale:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating sale",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Delete sale by ID
// @route   DELETE /sales/:id
// @access  Private
exports.deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const sale = await Sales.findById(id).session(session);

    if (!sale) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Return quantities to inventory
    for (const item of sale.items) {
      await updateInventoryQuantity(item.itemNumber, item.quantity, 'add', session);
    }

    // Delete the sale
    await Sales.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error deleting sale:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting sale",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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