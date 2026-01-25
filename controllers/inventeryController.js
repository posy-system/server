const Inventory = require("../models/Inventery");

// Create a new inventory item
const createInventoryItem = async (req, res) => {
  try {
    const { itemName, otherPrice, ourPrice, quantity, imageUrl } = req.body;

    const lastItem = await Inventory.findOne()
      .sort({ itemNumber: -1 })
      .select("itemNumber");

    const nextItemNumber = lastItem ? lastItem.itemNumber + 1 : 1;

    const newItem = new Inventory({
      itemName,
      itemNumber: nextItemNumber,
      otherPrice,
      ourPrice,
      quantity,
      imageUrl,
    });

    await newItem.save();

    res.status(201).json({
      message: "Inventory item created successfully",
      item: newItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get all inventory items
const getAllInventoryItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const items = await Inventory.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalItems = await Inventory.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      data: items,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

//  filter inventory Object ID
const getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Delete an inventory item by ID
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Inventory.findOneAndDelete({ _id: id });
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json({
      message: "Inventory item deleted successfully",
      item: deletedItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Update an inventory item by ID (partial update)
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, otherPrice, ourPrice, quantity, imageUrl } = req.body;

    const updateData = {};

    if (itemName !== undefined) updateData.itemName = itemName;
    if (otherPrice !== undefined) updateData.otherPrice = otherPrice;
    if (ourPrice !== undefined) updateData.ourPrice = ourPrice;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({
      message: "Inventory item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    res.status(500).json({ error: "Server Error" });
  }
};

// Search inventory items by itemName or itemNumber 
const searchInventoryItems = async (req, res) => {
  try {
    const { itemName, itemNumber } = req.query;
    const filter = {};
    if (itemName) {
      filter.itemName = { $regex: itemName, $options: "i" };
    }

    if (itemNumber) {
      const num = Number(itemNumber);

      if (isNaN(num)) {
        return res.status(400).json({ message: "itemNumber must be a number" });
      }

      filter.itemNumber = num;
    }

    if (!itemName && !itemNumber) {
      return res
        .status(400)
        .json({ message: "Provide itemName or itemNumber" });
    }

    const items = await Inventory.find(filter);

    res.status(200).json(items);
  } catch (error) {
    console.error("Search inventory error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

//  Get total count of inventery
const totalCount = async (req, res) => {
  try {
    const count = await Inventory.countDocuments();
    res.status(200).json({ totalCount: count });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  createInventoryItem,
  getAllInventoryItems,
  deleteInventoryItem,
  updateInventoryItem,
  getInventoryItemById,
  searchInventoryItems,
  totalCount,
};
