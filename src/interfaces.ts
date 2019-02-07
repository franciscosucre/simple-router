import { IncomingMessage, ServerResponse } from 'http';

export type HandlerFunction = (req: IRequest, res: IResponse, next?: INextFunction) => void;
export type INextFunction = () => any;
export interface IRequest extends IncomingMessage {
  [key: string]: any;
}
export interface IResponse extends ServerResponse {
  [key: string]: any;
}
