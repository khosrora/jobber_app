import { authService } from '@gateway/services/api/auth-service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class Password {
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await authService.forgotPassword(req.body.email);
    req.session = { jwt: response.data.token };
    res.status(StatusCodes.CREATED).json({ message: response.data.message });
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const response: AxiosResponse = await authService.resetPassword(req.params.token, password, confirmPassword);
    req.session = { jwt: response.data.token };
    res.status(StatusCodes.CREATED).json({ message: response.data.message });
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;
    const response: AxiosResponse = await authService.changePassword(currentPassword, newPassword);
    req.session = { jwt: response.data.token };
    res.status(StatusCodes.CREATED).json({ message: response.data.message });
  }
}
