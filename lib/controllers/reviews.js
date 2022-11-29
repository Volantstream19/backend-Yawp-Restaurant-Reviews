const { Router } = require('express');
const authenticate = require('../middleware/authenticate.js');
const deleteReview = require('../middleware/deleteReview.js');
// const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review.js');

module.exports = Router().delete(
  '/:id',
  [authenticate, deleteReview],
  async (req, res, next) => {
    try {
      const del = await Review.delete(req.params.id);
      if (!del) next();
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  }
);
