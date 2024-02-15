import { isLeft } from "@core/either";
import {
  IPostTransactionUseCase,
  PostTransactionInputDTO,
  PostTransactionOutputDTO,
} from "./post-transaction.usecase";
import IController from "@core/controller.interface";
import {
  Response,
  notFound,
  ok,
  serverError,
  unproucessableEntity,
} from "@core/response";

export type PostTransactionControllerRequest = PostTransactionInputDTO;
export type PostTransactionControllerResponse = Response<
  PostTransactionOutputDTO | Error
>;

export interface IPostTransactionController
  extends IController<
    PostTransactionControllerRequest,
    PostTransactionControllerResponse
  > {}

export default class PostTransactionController
  implements IPostTransactionController
{
  constructor(private readonly postTransaction: IPostTransactionUseCase) {}

  async handle({
    clientId,
    value,
    type,
    description,
  }: PostTransactionControllerRequest): Promise<PostTransactionControllerResponse> {
    const transaction = await this.postTransaction.execute({
      clientId,
      value,
      type,
      description,
    });

    if (isLeft(transaction)) {
      return this.handleError(transaction.left);
    }

    return ok(transaction.right);
  }

  private handleError(error: Error) {
    const errors = {
      ClientNotFoundError: notFound(error),
      InsufficientFundsError: unproucessableEntity(error),
    };

    return errors[error.name as keyof typeof errors] || serverError(error);
  }
}
