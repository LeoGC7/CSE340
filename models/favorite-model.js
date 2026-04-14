const pool = require("../database/")

/* ***************************
 * Add a vehicle to favorite
 * ************************** */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = "INSERT INTO public.favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("addFavorite error: " + error)
  }
}

/* ***************************
 * Remove a vehicle from favorites
 * ************************** */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = "DELETE FROM public.favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *"
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("removeFavorite error: " + error)
  }
}

/* ***************************
 * Return all favorites for a specific acount
 * ************************** */
async function getFavoritesByAccountId(account_id) {
  try {
    const sql = `SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_thumbnail 
                 FROM public.favorites f 
                 JOIN public.inventory i ON f.inv_id = i.inv_id 
                 WHERE f.account_id = $1`
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getFavorites error: " + error)
  }
}

/* ***************************
 * Check if the vehicle is already a favorite
 * ************************** */
async function checkFavorite(account_id, inv_id) {
  try {
    const sql = "SELECT * FROM public.favorites WHERE account_id = $1 AND inv_id = $2"
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rowCount > 0
  } catch (error) {
    console.error("checkFavorite error: " + error)
  }
}

module.exports = { 
    addFavorite, 
    removeFavorite, 
    getFavoritesByAccountId, 
    checkFavorite 
}