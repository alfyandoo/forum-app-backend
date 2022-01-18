const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });

    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'test title',
      body: 'test body',
      owner: 'user-123',
      date: '2022-01-12T02:04:43.260Z',
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.checkCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'test content',
        owner: 'user-123',
      }));
    });
  });

  describe('checkCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.checkCommentById('comment-456')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when comment found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const commmentId = await commentRepositoryPostgres.checkCommentById('comment-123');

      // Assert
      expect(commmentId).toEqual('comment-123');
    });
  });

  describe('checkCommentOwner function', () => {
    it('should throw AuthorizationError when not owner', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.checkCommentOwner('comment-123', 'user-456')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error when owner is valid', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.checkCommentOwner('comment-123', 'user-123')).resolves.toBeUndefined();
    });
  });

  describe('deleteComment function', () => {
    it('should throw error when comment not found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.deleteComment('comment-456')).rejects
        .toThrowError(NotFoundError);
    });

    it('should delete comment correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comment = await CommentsTableTestHelper.checkCommentById('comment-123');
      expect(comment[0].is_delete).toEqual(true);
    });
  });

  describe('getComment function', () => {
    it('should return empty array when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getComment('thread-123');

      // Assert
      expect(comment).toStrictEqual([]);
    });

    it('should get comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
        password: 'inipasswordy',
        fullname: 'John Doe',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        username: 'johndoe',
        owner: 'user-456',
        date: '2022-01-13T10:49:06.563Z',
        content: 'test new content',
        isDelete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getComment('thread-123');

      // Assert
      expect(comment).toHaveLength(2);
      expect(comment[0]).toStrictEqual(new GetComment({
        id: 'comment-123',
        username: 'dicoding',
        date: '2022-01-12T03:48:30.111Z',
        content: 'test content',
        isDelete: false,
      }));
      expect(comment[1]).toStrictEqual(new GetComment({
        id: 'comment-456',
        username: 'johndoe',
        date: '2022-01-13T10:49:06.563Z',
        content: '**komentar telah dihapus**',
        isDelete: true,
      }));
    });
  });
});
