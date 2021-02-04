import {CrossDown, CrossUp, EMA} from "technicalindicators";
import {CandleResponse, RequestCandle} from "./WebServer";
import assert = require("assert");

export class Backtest {
  private static readonly SHORT_EMA_LENGTH = 12;
  private static readonly LONG_EMA_LENGTH = 21;
  private static readonly POSITION_SIZE = 1;

  private readonly backtestId: number;
  private readonly shortEma: EMA;
  private readonly longEma: EMA;
  private readonly crossDown: CrossDown;
  private readonly crossUp: CrossDown;
  private currentPosition: number;

  constructor(backtestId: number) {
    this.backtestId = backtestId;
    this.shortEma = new EMA({
      period: Backtest.SHORT_EMA_LENGTH,
      values: [],
    });
    this.longEma = new EMA({
      period: Backtest.LONG_EMA_LENGTH,
      values: [],
    });
    this.crossDown = new CrossDown({
      lineA: [],
      lineB: [],
    });
    this.crossUp = new CrossUp({
      lineA: [],
      lineB: [],
    });
    this.currentPosition = 0;
  }

  public handleCandle(candle: RequestCandle): CandleResponse {
    const positionSize = this.getPositionSize(candle.close);
    this.currentPosition += positionSize;
    return {
      backtestId: this.backtestId,
      openPosition: {
        base: positionSize,
      },
      // closePosition: true,
    };
  }

  private getPositionSize(price: number): number {
    const shortEmaValue = this.shortEma.nextValue(price);
    const longEmaValue = this.longEma.nextValue(price);
    if (!shortEmaValue || !longEmaValue) return 0;
    const crossDown = this.crossDown.nextValue(shortEmaValue, longEmaValue);
    const crossUp = this.crossUp.nextValue(shortEmaValue, longEmaValue);
    if (crossUp) {
      // Current position is either 0 or negative.
      assert(this.currentPosition <= 0);
      return Math.abs(this.currentPosition) + Backtest.POSITION_SIZE;
    } else if (crossDown) {
      // Current position is either 0 or positive.
      assert(this.currentPosition >= 0);
      return this.currentPosition * -1 - Backtest.POSITION_SIZE;
    }
    return 0;
  }
}
