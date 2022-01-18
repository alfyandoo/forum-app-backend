const GetComment = require('../GetComment');

describe('GetComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: ['johndoe'],
      date: 2022,
      content: 'test content',
      isDelete: false,
    };

    // Action and Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should create GetComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-456',
      username: 'johndoe',
      date: '2022-01-13T10:49:06.563Z',
      content: 'test content',
      isDelete: false,
    };

    // Action
    const getComment = new GetComment(payload);

    // Assert
    expect(getComment.id).toEqual(payload.id);
    expect(getComment.username).toEqual(payload.username);
    expect(getComment.date).toEqual(payload.date);
    expect(getComment.content).toEqual(payload.content);
  });

  it('should create GetComment object correctly when value isDelete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-456',
      username: 'johndoe',
      date: '2022-01-13T10:49:06.563Z',
      content: 'test content',
      isDelete: true,
    };

    // Action
    const getComment = new GetComment(payload);

    // Assert
    expect(getComment.id).toEqual(payload.id);
    expect(getComment.username).toEqual(payload.username);
    expect(getComment.date).toEqual(payload.date);
    expect(getComment.content).toEqual('**komentar telah dihapus**');
  });
});
