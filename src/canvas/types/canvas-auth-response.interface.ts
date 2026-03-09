interface ICanvasUserAuthResponse {
  id: number;
  name: string;
}

export interface ICanvasAuthResponse {
  access_token: string;
  token_type: string;
  user: ICanvasUserAuthResponse;
  refresh_token: string;
  expires_in: number;
}
