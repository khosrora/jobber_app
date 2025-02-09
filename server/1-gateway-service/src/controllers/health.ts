import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class HealthController {
  public health(_req: Request, res: Response): void {
    res.status(StatusCodes.OK).send(`gateway service is healthy and Ok !!!`);
  }
}
