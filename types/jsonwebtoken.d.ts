declare module "jsonwebtoken" {
  import type { SignOptions, VerifyOptions } from "jsonwebtoken";
  const jwt: {
    sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: SignOptions): string;
    verify(token: string, secretOrPublicKey: string, options?: VerifyOptions): any;
    decode(token: string): null | { [key: string]: any } | string;
  };
  export default jwt;
}
