import db from "../database.js";

class BaseModel {
  static async runQuery(sql, params = []) {
    const result = await db.query(sql, params);
    return result.rows;
  }
}

export default BaseModel;