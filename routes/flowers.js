const express = require("express");
const {
  getFlowers,
  getFlower,
  createFlower,
  deleteFlower,
  updateFlower,
  flowerPhotoUpload
} = require("../controllers/flowers");

const router = express.Router({mergeParams:true});

const { protect, authorize } = require("../middleware/auth");


router
  .route("/")
  .get(getFlowers)
  .post(protect, createFlower);

router.route("/:id").get(getFlower).delete(protect,deleteFlower).put(protect, updateFlower);

router.route('/:id/photo').put(protect,flowerPhotoUpload);


module.exports = router;
