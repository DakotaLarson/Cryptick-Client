import express = require("express");
import bodyParser = require("body-parser");
import {Express, Request, Response} from "express";

interface RequestCandle {
  candleSetId: number;
  id: number;
  fromTradeId: number;
  toTradeId: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  baseVolume: number;
  buyerMakerVolume: number;
  buyerMakerBaseVolume: number;
  vwap: number;
  time: Date;
}

interface CandleRequest {
  backtestId: number;
  candle: RequestCandle;
}

interface CandleResponse {
  backtestId: number;
  openPosition?: {
    size: number;
  }
  closePosition?: boolean;
}

interface PingResponse {
  version: number;
  type: "backtest";
}

export class WebServer {

  private static readonly PORT = 4000;
  private static readonly CRYPTICK_VERSION = 1;
  private app: Express;

  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());

    this.onPostCandle = this.onPostCandle.bind(this);
    this.onPostTrades = this.onPostTrades.bind(this);
  }

  public initialize(): void {
    this.initRoutes();
    this.app.listen(WebServer.PORT, () => {
      console.log(`Server running on port ${WebServer.PORT}`);
    });
  }

  private initRoutes() {
    this.app.get("/ping", WebServer.onGetPing);
    this.app.post("/candle", this.onPostCandle);
    this.app.post("/trades", this.onPostTrades);

  }

  private static onGetPing(req: Request, res: Response) {
    const {version} = req.query;
    if (version !== `${WebServer.CRYPTICK_VERSION}`) {
      // A response can still be sent as the backtest will not proceed with a version mis-match.
      console.log(`WARNING: Unexpected Cryptick version received: ${version}`);
    }
    const response: PingResponse = {
      version: WebServer.CRYPTICK_VERSION,
      type: "backtest",
    };
    res.send(response);
  }

  private onPostCandle(req: Request, res: Response) {
    const {backtestId} = req.body as CandleRequest;
    console.log(backtestId);
    const response: CandleResponse = {
      backtestId,
    };
    res.json(response);
  }

  private onPostTrades(req: Request, res: Response) {
    res.sendStatus(200);
  }

}
