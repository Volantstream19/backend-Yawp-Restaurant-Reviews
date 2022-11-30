const { Router } = require('express');
const authenticate = require('../middleware/authenticate.js');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review.js');

module.exports = Router()
  .get('/', async (req, res, next) => {
    try {
      const restaurants = await Restaurant.getAll();
      res.json(restaurants);
    } catch (e) {
      next(e);
    }
  })

  .get('/:id', async (req, res, next) => {
    try {
      const restaurant = await Restaurant.getById(req.params.id);
      await restaurant.addReview();
      res.json(restaurant);
    } catch (e) {
      next(e);
    }
  })

  .post('/:id/reviews', authenticate, async (req, res, next) => {
    try {
      const review = await Review.insert({
        restaurantId: req.params.id,
        userId: req.user.id,
        detail: req.body.detail,
        stars: req.body.stars,
      });
      res.json(review);
    } catch (e) {
      next(e);
    }
  });
