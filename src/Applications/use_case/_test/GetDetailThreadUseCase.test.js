const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const GetThread = require('../../../Domains/threads/entities/GetThread');

describe('GetDetailThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedGetComment = [
      new GetComment({
        id: 'comment-123',
        username: 'dicoding',
        date: '2022-01-12T03:48:30.111Z',
        content: 'test content',
        isDelete: false,
      }),
      new GetComment({
        id: 'comment-456',
        username: 'johndoe',
        date: '2022-01-13T10:49:06.563Z',
        content: 'test new content',
        isDelete: true,
      }),
    ];

    const expectedGetThread = new GetThread({
      id: 'thread-123',
      title: 'test title',
      body: 'test body',
      date: '2022-01-12T02:04:43.260Z',
      username: 'dicoding',
      comments: expectedGetComment,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.getComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetComment));
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetThread));

    /** creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const thread = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.getComment).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getDetailThread).toBeCalledWith('thread-123');
    expect(thread).toEqual(new GetThread({ ...expectedGetThread, comments: expectedGetComment }));
  });
});
