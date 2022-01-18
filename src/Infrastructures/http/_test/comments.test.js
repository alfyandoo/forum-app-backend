const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const createServer = require('../createServer');
const container = require('../../container');
const pool = require('../../database/postgres/pool');

describe('/comments endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread not found!');
    });

    it('should response 401 when request did not have accessToken', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };

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
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload did not contain needed property', async () => {
      // Arrange
      const requestPayload = {};

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test body',
        owner: 'user-123',
        date: '2022-01-12T02:04:43.260Z',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload did not meet data specification', async () => {
      // Arrange
      const requestPayload = {
        content: [{}],
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test body',
        owner: 'user-123',
        date: '2022-01-12T02:04:43.260Z',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test body',
        owner: 'user-123',
        date: '2022-01-12T02:04:43.260Z',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread not found!');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test body',
        owner: 'user-123',
        date: '2022-01-12T02:04:43.260Z',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment not found!');
    });

    it('should response 403 when user delete another user\'s comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
        password: 'inipasswordy',
        fullname: 'John Doe',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-456',
        title: 'test title',
        body: 'test body',
        owner: 'user-456',
        date: '2022-01-12T02:04:43.260Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        threadId: 'thread-456',
        content: 'test content',
        owner: 'user-456',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-456/comments/comment-456',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('You are not the owner');
    });

    it('should response 401 when request did not have accesToken', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };

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
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 when delete comment correctly', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test body',
        owner: 'user-123',
        date: '2022-01-12T02:04:43.260Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test content',
        owner: 'user-123',
        date: '2022-01-12T03:48:30.111Z',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
