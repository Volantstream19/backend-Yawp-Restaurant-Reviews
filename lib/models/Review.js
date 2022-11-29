const pool = require('../utils/pool');

module.exports = class Review {
  id;
  user_id;
  restaurant_id;
  stars;
  detail;

  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.restaurant_id = row.restaurant_id;
    this.stars = row.stars;
    this.detail = row.detail;
  }
  // GET BY ID FUNCTION
  static async getReviewId(id) {
    const { rows } = await pool.query(
      `
      SELECT * FROM reviews WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return null;
    return new Review(rows[0]);
  }
  // DELETE FUCNTION
  static async delete(id) {
    const { rows } = await pool.query(
      `
    DELETE FROM reviews 
    WHERE id = $1
    RETURNING *`,
      [id]
    );
    return new Review(rows[0]);
  }
  // INSERT FUCNTINO
  static async insert({ restaurantId, userId, detail, stars }) {
    const { rows } = await pool.query(
      'INSERT INTO reviews (restaurant_id, user_id, detail, stars) VALUES ($1, $2, $3, $4) RETURNING *',
      [restaurantId, userId, detail, stars]
    );
    return new Review(rows[0]);
  }
};
