/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', threadId = 'thread-123', content = 'test content', owner = 'user-123', date = '2022-01-12T03:48:30.111Z', isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, owner, date, isDelete],
    };

    await pool.query(query);
  },

  async checkCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1 = 1');
  },
};

module.exports = CommentsTableTestHelper;
