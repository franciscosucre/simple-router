import { IncomingMessage, ServerResponse } from 'http';

export type HandlerFunction = (req: IRequest, res: IResponse, next?: INextFunction) => void;
export type INextFunction = () => any;
export interface IRequest {
  url?: string;
  method?: string;
  params?: {
    [key: string]: any;
  };
  [key: string]: any;
}
export interface IResponse extends ServerResponse {
  [key: string]: any;
}
