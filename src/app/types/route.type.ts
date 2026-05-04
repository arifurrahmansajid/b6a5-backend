import type { IRouter } from "express";

export interface Routes {
  path: string;
  router: IRouter;
}
