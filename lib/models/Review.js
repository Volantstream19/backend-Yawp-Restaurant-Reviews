const pool = require('../utils/pool');

module.exports = class Review {
  id;
  user_id;
  restaurant_id;
  detail;

  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.restaurant_id = row.restaurant_id;
    this.stars = row.stars;
    this.detail = row.detail;
  }

  static async insert({ restaurantId, userId, detail }) {
    const { rows } = await pool.query(
      'INSERT INTO reviews (restaurant_id, user_id, detail) VALUES ($1, $2, $3) RETURNING *',
      [restaurantId, userId, detail]
    );
    return new Review(rows[0]);
  }
};
