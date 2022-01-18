const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const GetComment = require('../../Domains/comments/entities/GetComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { threadId, content, owner } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, threadId, content, owner, date, isDelete],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async checkCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment not found!');
    }

    return commentId;
  }

  async checkCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('You are not the owner');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment not found!');
    }
  }

  async getComment(threadId) {
    const query = {
      text: 'SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1 ORDER BY comments.date ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((payload) => (
      new GetComment({
        id: payload.id,
        username: payload.username,
        date: payload.date,
        content: payload.content,
        isDelete: payload.is_delete,
      })
    ));
  }
}

module.exports = CommentRepositoryPostgres;
