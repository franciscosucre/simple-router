import { IncomingMessage } from 'http';

export type HandlerFunction = (req: IRequest, res: any, next?: INextFunction) => void;
export type INextFunction = () => any;

export interface IRequest extends IncomingMessage {
  params?: object;
}
