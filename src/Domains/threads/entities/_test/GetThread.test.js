const GetThread = require('../GetThread');

describe('GetThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'test title',
      body: {},
      date: '2022-01-12T02:04:43.260Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2022-01-12T03:48:30.111Z',
          content: 'test content',
          isDelete: false,
        },
        {
          id: 'comment-456',
          username: 'johndoe',
          date: '2022-01-13T10:49:06.563Z',
          content: 'test content',
          isDelete: true,
        },
      ],
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should create GetThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'test title',
      body: 'test body',
      date: '2022-01-12T02:04:43.260Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2022-01-12T03:48:30.111Z',
          content: 'test content',
          isDelete: false,
        },
        {
          id: 'comment-456',
          username: 'johndoe',
          date: '2022-01-13T10:49:06.563Z',
          content: '**komentar telah dihapus**',
          isDelete: true,
        },
      ],
    };

    // Action
    const getThread = new GetThread(payload);

    // Assert
    expect(getThread.id).toEqual(payload.id);
    expect(getThread.title).toEqual(payload.title);
    expect(getThread.body).toEqual(payload.body);
    expect(getThread.date).toEqual(payload.date);
    expect(getThread.username).toEqual(payload.username);
    expect(getThread.comments).toEqual(payload.comments);
  });
});
