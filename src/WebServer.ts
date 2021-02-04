import express = require("express");
import bodyParser = require("body-parser");
import {Express, Request, Response} from "express";
import {Backtest} from "./Backtest";

export interface RequestCandle {
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

export interface CandleResponse {
  backtestId: number;
  openPosition?: {
    base?: number;
    quote?: number;
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

  private readonly app: Express;
  private readonly backtestsByIds: Map<number, Backtest>;

  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.backtestsByIds = new Map();

    this.onPostCandle = this.onPostCandle.bind(this);
    this.handleBacktestRequest = this.handleBacktestRequest.bind(this);
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

    this.app.post("/backtest", this.handleBacktestRequest);
    this.app.delete("/backtest", this.handleBacktestRequest);

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
    const {backtestId, candle} = req.body as CandleRequest;
    const backtest = this.backtestsByIds.get(backtestId);
    if (backtest) {
      const response = backtest.handleCandle(candle);
      res.json(response);
    } else {
      console.log(`WARNING: No backtest found with id ${backtestId}`);
      res.sendStatus(500);
    }
  }

  private handleBacktestRequest(req: Request, res: Response) {
    const {backtestId} = req.body;
    if (!backtestId) {
      console.log("WARNING: Invalid backtest request");
      res.sendStatus(400);
      return;
    }
    if (req.method === "POST") {
      if (this.backtestsByIds.has(backtestId)) {
        console.log(`WARNING: Removed backtest with id ${backtestId}`);
        this.backtestsByIds.delete(backtestId);
      }
      this.backtestsByIds.set(backtestId, new Backtest(backtestId));
      console.log(`New backtest created with id: ${backtestId}`);
    } else if (req.method === "DELETE") {
      if (!this.backtestsByIds.delete(backtestId)) {
        console.log(`WARNING: No backtest to remove with id ${backtestId}`);
      }
      console.log(`Backtest completed with id ${backtestId}`);
    }
    res.sendStatus(200);
  }



}
