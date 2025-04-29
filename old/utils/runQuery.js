export const runQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) =>
        err ? reject(err) : resolve(results.rows)
      );
    });
  }