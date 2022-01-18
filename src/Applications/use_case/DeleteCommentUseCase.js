class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.checkThreadById(useCasePayload.threadId);
    await this._commentRepository.checkCommentById(useCasePayload.commentId);
    await this._commentRepository.checkCommentOwner(useCasePayload.commentId, useCasePayload.owner);

    return this._commentRepository.deleteComment(useCasePayload.commentId);
  }
}

module.exports = DeleteCommentUseCase;
