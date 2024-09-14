// @desc Get all contacts
// @route GET /api/v1/contacts
// @access Public

const path = require("path");
const Flower = require("../models/Flower");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");
const fs = require("fs");

exports.getFlowers = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.userId) {
    // Make sure user is contact owner
    if (req.user.id != req.params.userId && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User ${req.params.id} is not authorized to access this contact list.`,
          401
        )
      );
    }
    query = Flower.find({ user: req.params.userId });
  } else {
    query = await Flower.find();
  }

  const flowers = await query;

  res.status(200).json({ success: true, data: flowers });
});

// @desc Get Single Flower
// @route GET /api/v1/flowers/:id
// @access Public
exports.getFlower = asyncHandler(async (req, res, next) => {
  const contact = await Flower.findById(req.params.id);

  if (!contact) {
    return next(
      new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: contact });
});

// @desc Create Flower
// @route Post /api/v1/flowers
// @access Private

exports.createFlower = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const flower = await Flower.create(req.body);

  res
    .status(200)
    .json({ success: true, data: flower, msg: "Created new contact" });
});

// @desc Update Flower
// @route PUT /api/v1/flowers/:id
// @access Private

exports.updateFlower = asyncHandler(async (req, res, next) => {
  let flower = await Flower.findById(req.params.id);

  if (!flower) {
    return next(new ErrorResponse(`Contact not found with specified id`));
  }

  // Make sure user is contact owner
  if (flower.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this contact.`,
        401
      )
    );
  }

  contact = await Flower.findOneAndUpdate(
    new mongoose.Types.ObjectId(req.params.id),
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: flower, msg: "Updated contact" });
});

// @desc Delete Contact
// @route Delete /api/v1/contacts/:id
// @access Private

exports.deleteFlower = asyncHandler(async (req, res, next) => {
  const flower = await Flower.findById(req.params.id);

  // Make sure user is contact owner
  if (flower.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this contact`,
        401
      )
    );
  }

  await flower.deleteOne();

  // Asynchronously delete a file
  fs.unlink(`${process.env.FILE_UPLOAD_PATH}/${flower.photo}`, (err) => {
    if (err) {
      console.error("Error occurred while deleting the file:", err);
      return;
    }
    console.log("File deleted successfully");
  });

  res.status(200).json({ success: true, data: {}, msg: "Deleted contact" });
});

// @desc Upload Photo
// @route PUT /api/v1/flowers/:id/photo
// @access Private

exports.flowerPhotoUpload = asyncHandler(async (req, res, next) => {
  const flower = await Flower.findById(req.params.id);

  if (!flower) {
    return next(
      new ErrorResponse(`Flower not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom file name
  file.name = `photo_${flower._id}${path.parse(file.name).ext}`;

  // Upload file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
  });

  await Flower.findByIdAndUpdate(req.params.id, { photo: file.name });

  res.status(200).json({
    success: true,
    data: file.name,
  });
});
