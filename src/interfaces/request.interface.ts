import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

export interface RequestUser extends Request {
  user: JwtPayload;
  forwardedFrom?: string;
}
