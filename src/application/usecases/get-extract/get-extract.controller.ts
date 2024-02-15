import IController from "@core/controller.interface";
import IUseCase from "@core/usecase.interface";
import { GetExtractInputDTO, GetExtractOutputDTO } from "./get-extract.usecase";
import { ExtractDTO } from "@application/dtos/extract.dto";
import { isLeft } from "@core/either";
import { Response, notFound, ok, serverError } from "@core/response";

export type GetExtractControllerRequest = GetExtractInputDTO;
export type GetExtractControllerResponse = Response<ExtractDTO | Error>;

export default class GetExtractController
  implements
    IController<GetExtractControllerRequest, GetExtractControllerResponse>
{
  constructor(
    private readonly getExtract: IUseCase<
      GetExtractInputDTO,
      GetExtractOutputDTO
    >
  ) {}

  async handle({
    clientId,
  }: GetExtractControllerRequest): Promise<GetExtractControllerResponse> {
    const extract = await this.getExtract.execute({
      clientId,
    });

    if (isLeft(extract)) {
      return this.handleError(extract.left);
    }

    return ok(extract.right);
  }

  private handleError(error: Error) {
    const errors = {
      ClientNotFoundError: notFound(error),
    };

    return errors[error.name as keyof typeof errors] || serverError(error);
  }
}
